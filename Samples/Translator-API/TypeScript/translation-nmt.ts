import axios, { AxiosError } from 'axios';
import 'dotenv/config';

const globalEndpoint = 'https://api.cognitive.microsofttranslator.com';

const apiKey = process.env.API_KEY;
const region = process.env.REGION;

type TranslationResult = {
    detectedLanguage?: { language: string; score: number };
    translations: Array<{ text: string; to?: string; language?: string }>;
}

async function translateText(text: string, from: string, to: string): Promise<TranslationResult[]> {

    const headers: Record<string, string> = {
        'Ocp-Apim-Subscription-Key': apiKey!,
        'Ocp-Apim-Subscription-Region': region!,
        'Content-type': 'application/json',
    };

    const params = new URLSearchParams({ 'api-version': '2025-05-01-preview' });
    
    const body = [ 
        {
            text,
            language: from,
            targets: [{language: to}],
        },
    ]

    const response = await axios.post<TranslationResult[]>(`${globalEndpoint}/translate`, body, { headers, params });
    return response.data;
}

export async function main(): Promise<void> {
    const textToTranslate = "J'ai un problème avec ma commande.";
    const fromLanguage = 'fr';
    const targetLanguage = 'en';

    const translations = await translateText(textToTranslate, fromLanguage, targetLanguage);
    
    console.log('Translation Results:');
    console.log(`- [${targetLanguage}]: ${translations[0].translations[0].text}`);
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});