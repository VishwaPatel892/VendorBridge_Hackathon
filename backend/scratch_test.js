const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function test() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("API Key loaded:", apiKey ? "YES" : "NO");
    if (!apiKey) return;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Say hello!" }
                ]
            })
        });

        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response text:", text);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
