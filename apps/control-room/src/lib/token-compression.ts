/**
 * Token Compression Utility (jmunch-style)
 * Efficient prompt formatting for Claude API calls
 */

export interface CompressedContext {
    summary: string; // Concise context summary
    references: string[]; // File/symbol references (compact format)
    examples: string[]; // Minimal working examples
    encoding: string; // Compression method used
    originalTokens: number;
    compressedTokens: number;
}

/**
 * Compress code context by removing boilerplate and keeping only logic
 */
export function compressCode(code: string, maxLines = 50): string {
    const lines = code.split('\n');
    const essential: string[] = [];

    for (const line of lines) {
        // Skip empty lines, comments, and imports (unless key)
        if (!line.trim()) continue;
        if (line.trim().startsWith('//')) continue;
        if (line.trim().startsWith('/*')) continue;
        if (line.includes('import') && !line.includes('from')) continue;

        essential.push(line);

        if (essential.length >= maxLines) break;
    }

    return essential.join('\n').substring(0, 1000); // ~250 tokens max
}

/**
 * Create compact file reference (e.g., "file.ts:42-51")
 */
export function createFileReference(path: string, startLine?: number, endLine?: number): string {
    if (startLine && endLine) {
        return `${path}:${startLine}-${endLine}`;
    }
    if (startLine) {
        return `${path}:${startLine}`;
    }
    return path;
}

/**
 * Compress multiple files into a single context object
 */
export function compressContext(files: Record<string, string>, description: string): CompressedContext {
    const references: string[] = [];
    const examples: string[] = [];
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (const [path, code] of Object.entries(files)) {
        totalOriginal += code.length / 4; // Rough token estimate
        const compressed = compressCode(code, 30);
        totalCompressed += compressed.length / 4;

        references.push(path);
        if (compressed.length > 0) {
            examples.push(`--- ${path} ---\n${compressed}`);
        }
    }

    return {
        summary: description,
        references,
        examples,
        encoding: 'jmunch-v1',
        originalTokens: Math.ceil(totalOriginal),
        compressedTokens: Math.ceil(totalCompressed),
    };
}

/**
 * Format message for Claude with compression metadata
 */
export function formatCompressedMessage(
    task: string,
    context: CompressedContext
): { role: string; content: string } {
    const header = `## Task
${task}

## Context (${context.compressedTokens}/${context.originalTokens} tokens, ${Math.round((context.compressedTokens / context.originalTokens) * 100)}% reduction)
${context.summary}

### Files Referenced
${context.references.map((ref) => `- ${ref}`).join('\n')}

### Code Examples
${context.examples.join('\n\n')}`;

    return {
        role: 'user',
        content: header,
    };
}

/**
 * Estimate tokens (rough Claude 3 estimate)
 */
export function estimateTokens(text: string): number {
    // Rough heuristic: ~4 chars per token for English
    return Math.ceil(text.length / 4);
}

/**
 * Smart message truncation (keep essential parts)
 */
export function truncateMessage(text: string, maxTokens: number = 2000): string {
    const roughTokens = estimateTokens(text);
    if (roughTokens <= maxTokens) {
        return text;
    }

    const targetChars = maxTokens * 4;
    const lines = text.split('\n');
    let kept = '';
    let dropped = 0;

    for (const line of lines) {
        if ((kept + line).length > targetChars) {
            dropped++;
            continue;
        }
        kept += line + '\n';
    }

    return (
        kept +
        `\n\n[... ${dropped} lines truncated (${roughTokens - estimateTokens(kept)} tokens saved) ...]`
    );
}

/**
 * Compress system prompt (remove redundant instructions)
 */
export function compressSystemPrompt(prompt: string): string {
    const sections = prompt.split('\n\n');
    const essential: string[] = [];

    for (const section of sections) {
        // Keep only non-tutorial/example sections
        if (section.includes('Example:') || section.includes('Tutorial:')) {
            continue;
        }
        if (section.length > 10) {
            essential.push(section);
        }
    }

    return essential.join('\n\n').substring(0, 500); // Keep under 125 tokens
}

/**
 * ZTE Context Snapshot (minimal state for agent recalls)
 */
export interface ZTESnapshot {
    bead_id: string;
    stage: string;
    elapsed_seconds: number;
    last_action: string;
    blockers: string[];
    cost_cents: number;
    compressed: true;
}

export function createZTESnapshot(
    beadId: string,
    stage: string,
    elapsed: number,
    lastAction: string,
    blockers: string[] = [],
    cost: number = 0
): ZTESnapshot {
    return {
        bead_id: beadId,
        stage,
        elapsed_seconds: elapsed,
        last_action: lastAction,
        blockers,
        cost_cents: cost,
        compressed: true,
    };
}
