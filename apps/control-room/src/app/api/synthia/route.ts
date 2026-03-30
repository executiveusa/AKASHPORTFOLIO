import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { osTools } from '@/lib/os-tools';
import { agentState, telemetry, memoryStore } from '@/lib/supabase-client';
import { remotionSkill, handleRemotionCall } from '@/lib/remotion-skill';
import { formatCompressedMessage, estimateTokens } from '@/lib/token-compression';
import { OrgoManager } from '@/lib/orgo';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const orgo = new OrgoManager(process.env.ORGO_TOKEN || '');

interface ToolCall {
    tool: string;
    action?: string;
    [key: string]: any;
}

export async function POST(req: Request) {
    const sessionId = `session-${Date.now()}`;

    try {
        const { message, agentId = 'synthia-0' } = await req.json();

        // Update agent status
        await agentState.updateStatus(agentId, 'working', 'Processing message');

        // Load system prompt
        const promptPath = path.join(process.cwd(), '../../synthia_core.md');
        let systemPrompt = `You are Synthia 3.0 - an autonomous digital CEO operating in a Zero-Touch Engineering environment.
You have access to tools: shell, write, remotion, memory.
Respond with JSON tool calls in markdown code blocks when you need to take action.
Format: {"tool": "...", "action": "...", ...params}`;

        try {
            systemPrompt = fs.readFileSync(promptPath, 'utf8');
        } catch (e) {
            /* use default */
        }

        // Log session start
        await telemetry.logEvent(sessionId, 'session_start', `Synthia session initiated by ${agentId}`, {
            message_preview: message.substring(0, 100),
        });

        const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
            { role: 'user', content: message },
        ];

        // 1. Call Claude with tool use
        const response = await anthropic.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
            temperature: 0.7,
        });

        const firstMessage = response.content[0];
        let responseText =
            firstMessage.type === 'text' ? firstMessage.text : 'No response generated';

        // 2. Parse and execute tool calls
        const toolMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        let toolOutput = '';
        let toolsUsed: string[] = [];

        if (toolMatch) {
            try {
                const toolSpec: ToolCall = JSON.parse(toolMatch[1]);
                toolsUsed.push(toolSpec.tool);

                // Log tool call
                await telemetry.logEvent(sessionId, 'tool_call', `Executing: ${toolSpec.tool}`, toolSpec);

                // Execute based on tool type
                if (toolSpec.tool === 'shell') {
                    const res = await osTools.executeCommand(toolSpec.command);
                    const cloudRes = await orgo.executeOnCloud(toolSpec.command);
                    toolOutput = `LOCAL:\n${res.stdout}\n\nCLOUD:\n${JSON.stringify(cloudRes)}`;
                } else if (toolSpec.tool === 'write') {
                    await osTools.writeFile(toolSpec.path, toolSpec.content);
                    toolOutput = `File written: ${toolSpec.path}`;
                } else if (toolSpec.tool === 'remotion') {
                    const remotionResult = await handleRemotionCall(
                        toolSpec.action || 'render',
                        toolSpec,
                        agentId
                    );
                    toolOutput = JSON.stringify(remotionResult);
                } else if (toolSpec.tool === 'memory') {
                    // Store observation in vector DB
                    const embedding = Array(384).fill(0); // Placeholder: use actual embedding
                    const memResult = await memoryStore.storeMemory(
                        toolSpec.title || 'Observation',
                        toolSpec.content || '',
                        embedding,
                        agentId,
                        toolSpec.metadata
                    );
                    toolOutput = `Memory stored: ${JSON.stringify(memResult.data?.[0]?.id)}`;
                }

                // Log success
                await telemetry.logEvent(
                    sessionId,
                    'tool_success',
                    `${toolSpec.tool} completed`,
                    { toolOutput: toolOutput.substring(0, 500) }
                );

                // Second pass: inform Claude of result
                const followUpMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
                    ...messages,
                    { role: 'assistant', content: responseText },
                    { role: 'user', content: `Tool executed. Output:\n${toolOutput}\n\nProceed with summary.` },
                ];

                const finalResponse = await anthropic.messages.create({
                    model: 'claude-opus-4-6',
                    max_tokens: 2048,
                    system: systemPrompt,
                    messages: followUpMessages,
                    temperature: 0.7,
                });

                const finalMessage = finalResponse.content[0];
                responseText = finalMessage.type === 'text' ? finalMessage.text : responseText;
            } catch (e: any) {
                await telemetry.logEvent(sessionId, 'tool_error', `Tool failed: ${e.message}`, {
                    error: e.message,
                });
                responseText += `\n\n[Tool Error: ${e.message}]`;
            }
        }

        // Update agent status to idle
        await agentState.updateStatus(agentId, 'idle');

        // Log completion
        await telemetry.logEvent(sessionId, 'session_complete', 'Synthia session completed', {
            tokens_used: estimateTokens(responseText),
            tools_used: toolsUsed,
        });

        return NextResponse.json({
            success: true,
            response: responseText,
            sessionId,
            toolsUsed,
        });
    } catch (error: any) {
        await telemetry.logEvent(sessionId, 'session_error', `Error: ${error.message}`, {
            error: error.message,
        });

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                sessionId,
            },
            { status: 500 }
        );
    }
}
