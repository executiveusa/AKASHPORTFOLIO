/**
 * MiniMax API Wrapper for Synthia 3.0
 *
 * SECURITY: All credentials read from environment variables.
 * Never hardcode API keys. See .env.example for required vars.
 */

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface MiniMaxResponse {
    choices: { message: { content: string } }[];
    usage?: { total_tokens: number };
}

/**
 * Call MiniMax LLM and return the text content of the response.
 */
export async function callMiniMax(messages: ChatMessage[], model = 'abab6.5s-chat'): Promise<string> {
    const apiKey = process.env.MINIMAX_API_KEY;
    const teamId = process.env.MINIMAX_TEAM_ID;

    if (!apiKey || !teamId) {
        console.warn('[MiniMax] Missing MINIMAX_API_KEY or MINIMAX_TEAM_ID env vars. Using mock response.');
        return mockResponse(messages[messages.length - 1]?.content || '');
    }

    const url = `https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${teamId}`;

    const payload = {
        model,
        messages,
        tools: [],
        stream: false,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`MiniMax API Error ${response.status}: ${JSON.stringify(error)}`);
        }

        const data: MiniMaxResponse = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
    } catch (err) {
        console.error('[MiniMax] API call failed:', err);
        return mockResponse(messages[messages.length - 1]?.content || '');
    }
}

/**
 * Graceful fallback when API is unavailable — returns a plausible stub.
 */
function mockResponse(lastMessage: string): string {
    const isJson = lastMessage.toLowerCase().includes('json') || lastMessage.includes('{');
    if (isJson) {
        return JSON.stringify({
            vote: 'abstain',
            confidence: 50,
            reasoning: 'Sistema en modo fallback. API de LLM no disponible temporalmente.',
            concerns: ['Verificar MINIMAX_API_KEY en variables de entorno'],
        });
    }
    return 'Sistema Synthia 3.0 activo en modo fallback. Verificar credenciales de API en .env.local';
}
