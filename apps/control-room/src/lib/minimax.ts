/**
 * MiniMax API Wrapper for Synthia 3.0 (Fallback Provider)
 * NOTE: Primary provider is now Claude (Anthropic). MiniMax kept as fallback.
 */

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function callMiniMax(messages: ChatMessage[]) {
    const apiKey = process.env.MINIMAX_API_KEY;
    const teamId = process.env.MINIMAX_TEAM_ID;

    if (!apiKey || !teamId) {
        throw new Error('MiniMax credentials not configured in environment');
    }

    const url = `https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${teamId}`;

    const payload = {
        model: 'abab6.5s-chat',
        messages: messages,
        tools: [],
        stream: false,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`MiniMax API Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    } catch (err) {
        console.error('[MiniMax] API call failed:', err);
        throw err;
    }
}
