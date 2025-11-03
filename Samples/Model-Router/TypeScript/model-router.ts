import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import "dotenv/config";

const azureInferenceEndpoint = process.env.AZURE_INFERENCE_SDK_ENDPOINT;
const azureInferenceKey = process.env.AZURE_INFERENCE_SDK_KEY;

export async function main(): Promise<void> {
    const endpoint = azureInferenceEndpoint;
    const key = azureInferenceKey;

    if (!endpoint || !key) {
        throw new Error("AZURE_INFERENCE_SDK_ENDPOINT and AZURE_INFERENCE_SDK_KEY environment variables must be set");
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(key));

    const messages = [
        { role: "system", content: "You are an helpful assistant" },
        { role: "user", content: "Write a comprehensive account of solo backpacking adventure through South America, covering countries like Colombia, Peru, Bolivia, and Argentina. Detail the challenges and triumphs of traveling solo, your interactions with locals, and the cultural diversity you encountered along the way. Include must-visit attractions, unique experiences like hiking the Inca Trail or exploring Patagonia, and recommendations for budget travelers. Provide a structured itinerary, a cost breakdown, and safety tips for solo adventurers in the region." },
    ];

    const requestBody = {
        messages: messages,
        max_tokens: 9321,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        model: "model-router",
    };

    const response = await client.path("/chat/completions").post({
        body: requestBody,
    });

    // Print the selected model
    console.log("Model chosen by the router:", (response as any).body?.model ?? "(unknown)");

    // Print the model's response
    console.log("Model response:", (response as any).body?.choices?.[0]?.message?.content);

    // Print usage data
    console.log("Usage:", (response as any).body?.usage);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
    process.exit(1);
});