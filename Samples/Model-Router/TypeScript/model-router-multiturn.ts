import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import * as readline from 'readline';
import "dotenv/config";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

const azureInferenceEndpoint = process.env.AZURE_INFERENCE_SDK_ENDPOINT;
const azureInferenceKey = process.env.AZURE_INFERENCE_SDK_KEY;

/**
 * Trim conversation history to keep system message plus the last N user/assistant turns.
 * @param messages - Full history including system message at index 0
 * @param maxHistoryTurns - Number of recent user+assistant pairs to retain
 * @returns Trimmed message history
 */
function trimHistory(messages: ChatMessage[], maxHistoryTurns: number): ChatMessage[] {
    if (!messages.length) {
        return messages;
    }

    // Always preserve the first message if it is the system message
    const head = messages.slice(0, 1);
    const body = messages.slice(1);

    // Count pairs in body. We'll keep the last 2*maxHistoryTurns messages
    const keep = maxHistoryTurns * 2;
    if (body.length <= keep) {
        return [...head, ...body];
    } else {
        return [...head, ...body.slice(-keep)];
    }
}

/**
 * Run an interactive, multi-turn console chat using Azure Model Router.
 * 
 * - Maintains conversation history (system + rolling window of recent turns)
 * - Sends full history each turn for context
 * - Type 'exit' or 'quit' to end the session
 */
export async function main(): Promise<void> {
    const endpoint = azureInferenceEndpoint;
    const key = azureInferenceKey;

    if (!endpoint || !key) {
        throw new Error("AZURE_INFERENCE_SDK_ENDPOINT and AZURE_INFERENCE_SDK_KEY environment variables must be set");
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(key));

    // Conversation state: always begin with system message
    const messages: ChatMessage[] = [
        { role: "system", content: "You are a helpful assistant." }
    ];

    const maxHistoryTurns = 12;
    const maxTokens = 8192;
    const temperature = 0.7;
    const topP = 0.95;
    const frequencyPenalty = 0.0;
    const presencePenalty = 0.0;

    // Setup readline interface for user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Interactive chat started. Type 'exit' or 'quit' to stop.\n");

    const askQuestion = (question: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    };

    try {
        while (true) {
            const userInput = (await askQuestion("You: ")).trim();

            if (!userInput) {
                continue;
            }

            if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
                console.log("Goodbye.");
                break;
            }

            // Append user turn
            messages.push({ role: "user", content: userInput });

            // Trim history to keep context small while preserving the system message
            const trimmedMessages = trimHistory(messages, maxHistoryTurns);

            const requestBody = {
                messages: trimmedMessages,
                max_tokens: maxTokens,
                temperature: temperature,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty,
                model: "model-router",
            };

            try {
                const response = await client.path("/chat/completions").post({
                    body: requestBody,
                });

                // Extract assistant message
                const assistantMessage = (response as any).body?.choices?.[0]?.message?.content ?? 
                                       (response as any).body?.choices?.[0]?.content ?? 
                                       "(no model response)";

                // Extract routed model info
                const routedModel = (response as any).body?.model ?? 
                                  (response as any).body?.result?.model ?? 
                                  "<unknown>";

                console.log(`\n[model: ${routedModel}]\nAssistant: ${assistantMessage}\n`);

                // Append assistant turn to the full history
                messages.push({ role: "assistant", content: assistantMessage });

            } catch (apiError) {
                console.error("Error calling model router:", apiError);
                console.log("Please try again or type 'exit' to quit.\n");
            }
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    } finally {
        rl.close();
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nExiting...');
    process.exit(0);
});

// Run the main function if this file is executed directly
main().catch((err) => {
    console.error("The sample encountered an error:", err);
    process.exit(1);
});
