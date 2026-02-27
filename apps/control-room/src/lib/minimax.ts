/**
 * MiniMax API Wrapper for Synthia 3.0
 */

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function callMiniMax(messages: ChatMessage[]) {
    const apiKey = "sk-api-78EEEmrrKesi9I7afuY4F_xmFnjO1H2FMesIFZ27I-nlJpNkaEUUuiI8xS5b8Gm71gQO6deI4DWi1_w920QxkAhu_wsOXtArzUupOhXvrSHB1DIj_wF57Ps";
    const teamId = "2015968731565396613";
    const url = `https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${teamId}`;

    const payload = {
        model: "abab6.5s-chat", // Or chosen model from docs
        messages: messages,
        tools: [], // We will expand this for Agent Zero functionality
        stream: false
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`MiniMax API Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Critical OS Failure (MiniMax):", err);
        throw err;
    }
}
