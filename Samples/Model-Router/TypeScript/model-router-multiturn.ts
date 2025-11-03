import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import * as readline from 'readline';
import "dotenv/config";

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

const { AZURE_INFERENCE_SDK_ENDPOINT: endpoint, AZURE_INFERENCE_SDK_KEY: key } = process.env;

// Trim conversation history to keep system message plus the last N user/assistant turns.
function trimHistory(messages: ChatMessage[], maxHistoryTurns: number): ChatMessage[] {
    if (!messages.length) {
        return messages;
    }

    // Always preserve the first message if it is the system message
    const head = messages.slice(0, 1);
    const body = messages.slice(1);

    // Count pairs in body. We'll keep the last 2*maxHistoryTurns messages
    const keep = maxHistoryTurns * 2;
    return [...head, ...body.slice(-keep)];
}

export async function main(): Promise<void> {
    if (!endpoint || !key) {
        throw new Error("AZURE_INFERENCE_SDK_ENDPOINT and AZURE_INFERENCE_SDK_KEY environment variables must be set");
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(key));
    
    const messages: ChatMessage[] = [
        { role: "system", content: "You are a helpful assistant." }
    ];

    const maxHistoryTurns = 12;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Interactive chat started. Type 'exit' or 'quit' to stop.\n");

    const askQuestion = (question: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer));
        });
    };

    try {
        while (true) {
            const userInput = (await askQuestion("You: ")).trim();
            const isExitCommand = ["exit", "quit"].includes(userInput.toLowerCase());

            if (!userInput || isExitCommand) {
                if (isExitCommand) console.log("Goodbye.");
                break;
            }

            messages.push({ role: "user", content: userInput });

            const trimmedMessages = trimHistory(messages, maxHistoryTurns);

            const requestBody = {
                messages: trimmedMessages,
                max_tokens: 8192,
                temperature: 0.7,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0,
                model: "model-router",
            };

            const response = await client.path("/chat/completions").post({
                body: requestBody,
            });

            const { body } = response as any;
            const assistantContent = body?.choices?.[0]?.message?.content;

            console.log(`Model chosen by the router: ${body?.model ?? "(unknown)"}`);
            console.log(`Assistant: ${assistantContent}`);
            console.log(`Usage:`, body?.usage);
            console.log();

            messages.push({ role: "assistant", content: assistantContent });
        }
    } finally {
        rl.close();
    }
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
    process.exit(1);
});
