import fs from 'fs';
import axios from 'axios';
import 'dotenv/config';

const apiKey = process.env.AZURE_API_KEY;
const azureEndpoint = process.env.AZURE_ENDPOINT;
const modelName = process.env.MODEL_NAME;

type DocumentAIResponse = {
    usage_info: {
        pages_processed: number;
        doc_size_bytes: number;
    };
    pages: Array<{
        markdown: string;
    }>;
};

function encodePdfToBase64(pdfPath: string): string {
    const pdfContent = fs.readFileSync(pdfPath);
    return pdfContent.toString('base64');
}

async function processPdfWithMistral(pdfPath: string): Promise<DocumentAIResponse> {
    console.log('🔄 DEMO: PDF to Structured Data with Mistral Document AI');
    console.log('='.repeat(60));

    // Show file info
    const stats = fs.statSync(pdfPath);
    const fileSizeKb = stats.size / 1024;
    console.log(`📄 Input File: ${pdfPath}`);
    console.log(`📊 File Size: ${fileSizeKb.toFixed(1)} KB`);

    // Encode PDF to base64
    console.log('\n🔄 Step 1: Encoding PDF to base64...');
    const base64Content = encodePdfToBase64(pdfPath);
    console.log(`✅ Encoded ${base64Content.length.toLocaleString()} characters`);

    // API endpoint and headers
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
    };

    // Request payload
    const payload = {
        model: modelName,
        document: {
            type: 'document_url',
            document_url: `data:application/pdf;base64,${base64Content}`,
        },
        include_image_base64: true,
    };

    console.log('\n🚀 Step 2: Sending to Mistral Document AI...');
    console.log(`🔗 Endpoint: ${azureEndpoint}`);

    const startTime = Date.now();
    const response = await axios.post<DocumentAIResponse>(azureEndpoint!, payload, { headers });
    const endTime = Date.now();

    const processingTime = (endTime - startTime) / 1000;

    console.log(`✅ Success! Processing completed in ${processingTime.toFixed(2)} seconds`);
    console.log(`📄 Pages processed: ${response.data.usage_info.pages_processed}`);
    console.log(`📊 Document size: ${response.data.usage_info.doc_size_bytes.toLocaleString()} bytes`);

    return response.data;
}

export async function main(): Promise<void> {
    console.log('🎯 DEMO SCENARIO: Recipe PDF to Shopping List');
    console.log('='.repeat(60));
    console.log('Problem: I have a recipe PDF and want to:');
    console.log('  • Extract the text accurately');
    console.log('  • Generate a shopping list');
    console.log('  • Get cooking parameters');
    console.log('\nSolution: AI-powered document processing!\n');

    let pdfPath = '';

    // Check if PDF file exists
    if (!fs.existsSync(pdfPath)) {
        console.log('📁 Please place your PDF file in the project directory.');
        console.log(`📂 Current directory: ${process.cwd()}`);
        console.log('\n🔍 Available PDF files:');
        const files = fs.readdirSync('.');
        const pdfFiles = files.filter((f: string) => f.endsWith('.pdf'));
        if (pdfFiles.length > 0) {
            for (const file of pdfFiles) {
                console.log(`  📄 ${file}`);
            }
            pdfPath = pdfFiles[0];
            console.log(`\n🎯 Using: ${pdfPath}`);
        } else {
            console.log('  ❌ No PDF files found');
            return;
        }
    }

    // Process the PDF
    const result = await processPdfWithMistral(pdfPath);

    // Save result
    const outputFile = 'document_ai_result.json';
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`\n💾 Raw extraction saved to: ${outputFile}`);

    // Show preview
    console.log('\n👀 PREVIEW - First 200 characters:');
    console.log('-'.repeat(40));
    const firstPageContent = result.pages[0].markdown.substring(0, 200);
    console.log(`${firstPageContent}...`);

    console.log('\n🎉 DEMO COMPLETE - Ready for Phase 2!');
    console.log('▶️  Next: Run \'pnpm start:shopping-list-pdf\' to see the magic!');
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
