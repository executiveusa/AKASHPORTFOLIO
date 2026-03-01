import { NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';
import { osTools } from '@/lib/os-tools';
import { synthiaObservability } from '@/lib/observability';
import { OrgoManager } from '@/lib/orgo';
import { synthiaPerplexity } from '@/lib/perplexity-logic';
import fs from 'fs';
import path from 'path';

const orgo = new OrgoManager(process.env.ORGO_TOKEN || '');

/**
 * Call Synthia 3.0 Rust Backend (Primary)
 * Supports desktop, mobile, tablet, all devices
 */
async function callSynthiaBackend(messages: any[]) {
    const synthiaUrl = process.env.SYNTHIA_BACKEND_URL || 'http://localhost:42617';

    try {
        const response = await fetch(`${synthiaUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
                language: 'es'
            })
        });

        if (!response.ok) {
            throw new Error(`Synthia backend returned ${response.status}`);
        }

        const data = await response.json();
        return {
            choices: [{
                message: {
                    content: data.content || data.response || 'Synthia 3.0 operational'
                }
            }]
        };
    } catch (error) {
        console.warn('Synthia backend unavailable, falling back to MiniMax:', error);
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const userAgent = req.headers.get('user-agent') || '';
        const deviceType = userAgent.match(/mobile|android|iphone|ipad/i) ? 'mobile' : 'desktop';

        // Load sys prompt
        const promptPath = path.join(process.cwd(), '../../synthia_core.md');
        let systemPrompt = "You are Synthia 3.0.";
        try { systemPrompt = fs.readFileSync(promptPath, 'utf8'); } catch (e) { }

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ];

        // 1. Try Synthia 3.0 Rust Backend FIRST (works on all devices)
        let result;
        try {
            result = await callSynthiaBackend(messages as any);
            synthiaObservability.logEvent({
                sessionId: 'current',
                type: 'api_call',
                summary: `Synthia Rust Backend Response (${deviceType})`,
                data: { device: deviceType }
            });
        } catch (backendError) {
            // Fallback to MiniMax if backend unavailable
            console.log('Synthia backend failed, using MiniMax fallback');
            result = await callMiniMax(messages as any);
            synthiaObservability.logEvent({
                sessionId: 'current',
                type: 'api_call',
                summary: `MiniMax Fallback (${deviceType})`,
                data: { device: deviceType }
            });
        }
        const responseText = result.choices[0].message.content;

        // 2. Check for tool calls (simple JSON parsing from markdown)
        const toolMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        let toolOutput = "";

        if (toolMatch) {
            try {
                const toolSpec = JSON.parse(toolMatch[1]);

                if (toolSpec.tool === 'shell') {
                    synthiaObservability.logEvent({
                        sessionId: 'current',
                        type: 'tool_call',
                        summary: `Executing shell (Local+Cloud): ${toolSpec.command}`,
                        data: toolSpec
                    });

                    // Local execution
                    const res = await osTools.executeCommand(toolSpec.command);

                    // Cloud execution (Orgo)
                    const cloudRes = await orgo.executeOnCloud(toolSpec.command);

                    toolOutput = `LOCAL STDOUT: ${res.stdout}\nLOCAL STDERR: ${res.stderr}\nCLOUD OUTPUT: ${JSON.stringify(cloudRes)}`;
                } else if (toolSpec.tool === 'write') {
                    synthiaObservability.logEvent({
                        sessionId: 'current',
                        type: 'tool_call',
                        summary: `Writing file: ${toolSpec.path}`,
                        data: toolSpec
                    });
                    await osTools.writeFile(toolSpec.path, toolSpec.content);
                    toolOutput = `File ${toolSpec.path} has been written successfully.`;
                }

                // Log success event
                synthiaObservability.logEvent({
                    sessionId: 'current',
                    type: 'success',
                    summary: `Tool output received.`,
                    data: { output: toolOutput }
                });

                // 3. Second pass to inform Synthia of output
                const followUpMessages = [
                    ...messages,
                    { role: 'assistant', content: responseText },
                    { role: 'user', content: `Tool Output: ${toolOutput}\n\nPlease proceed with your summary.` }
                ];
                const finalResult = await callMiniMax(followUpMessages as any);

                return NextResponse.json({
                    success: true,
                    response: finalResult.choices[0].message.content,
                    toolUsed: toolSpec.tool
                });

            } catch (e: any) {
                console.error("Tool execution failed:", e);
                return NextResponse.json({
                    success: true,
                    response: `${responseText}\n\n[Kernel Error: ${e.message}]`
                });
            }
        }

        return NextResponse.json({
            success: true,
            response: responseText
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
