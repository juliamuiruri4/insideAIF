import axios from 'axios';
import 'dotenv/config';

const globalEndpoint = 'https://api.cognitive.microsofttranslator.com';

const foundryKey = process.env.FOUNDRY_API_KEY;
const apiKey = process.env.API_KEY;
const region = process.env.REGION;

type TranslationResult = {
    detectedLanguage?: { language: string; score: number };
    translations: Array<{ text: string; to?: string; language?: string }>;
}

async function translateWithLLM(text: string, from: string, to: string, model: string, tone: string, gender: string): Promise<TranslationResult[]> {
    const headers: Record<string, string> = {
        'Ocp-Apim-Subscription-Key': foundryKey!,
        'Ocp-Apim-Subscription-Region': region!,
        'Content-type': 'application/json',
    };

    const params = new URLSearchParams({ 'api-version': '2025-05-01-preview' });

    const body = [
        {
            text,
            language: from,
            targets: [{ language: to, deploymentName: model, tone: tone, gender: gender }],
        },
    ];

    const response = await axios.post<TranslationResult[]>(`${globalEndpoint}/translate`, body, { headers, params });
    return response.data;
}

async function translateWithNMT(text: string, from: string, to: string): Promise<TranslationResult[]> {
    const headers: Record<string, string> = {
        'Ocp-Apim-Subscription-Key': apiKey!,
        'Ocp-Apim-Subscription-Region': region!,
        'Content-type': 'application/json',
    };

    const params = new URLSearchParams({ 'api-version': '2025-05-01-preview' });

    const body = [
        {
            "text": text,
            language: from,
            targets: [{ language: to }],
        },
    ];

    const response = await axios.post<TranslationResult[]>(`${globalEndpoint}/translate`, body, { headers, params });
    return response.data;
}

export async function main(): Promise<void> {
    const textToTranslate = "Your case has been forwarded to the support supervisor, April Gittens. She will contact you today to review the situation.";
    const fromLanguage = 'en';
    const targetLanguages = ['fr', 'es'];
    const model = 'your-gpt-model-deployment';
    const tone = 'informal';
    const gender = 'male';

    const llmResults = await Promise.all(targetLanguages.map((t) => translateWithLLM(textToTranslate, fromLanguage, t, model, tone, gender)));
    console.log('LLM Translation Results:');
    targetLanguages.forEach((t, i) => {
        console.log(`- [${t}]: ${llmResults[i][0].translations[0].text}`);
    });

    const nmtResults = await Promise.all(targetLanguages.map((t) => translateWithNMT(textToTranslate, fromLanguage, t)));
    console.log('NMT Translation Results:');
    targetLanguages.forEach((t, i) => {
        console.log(`- [${t}]: ${nmtResults[i][0].translations[0].text}`);
    });
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});