import fs from 'fs';
import path from 'path';
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

function encodeImageToBase64(imagePath: string): string {
    const imageContent = fs.readFileSync(imagePath);
    return imageContent.toString('base64');
}

function getImageMimeType(imagePath: string): string {
    const extension = path.extname(imagePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
    };
    return mimeTypes[extension] || 'image/jpeg';
}

async function processImageWithMistral(imagePath: string): Promise<DocumentAIResponse> {
    console.log('🔄 DEMO: Image to Structured Data with Mistral Document AI');
    console.log('='.repeat(60));

    // Show file info
    const stats = fs.statSync(imagePath);
    const fileSizeKb = stats.size / 1024;
    const mimeType = getImageMimeType(imagePath);
    console.log(`🖼️  Input Image: ${imagePath}`);
    console.log(`📊 File Size: ${fileSizeKb.toFixed(1)} KB`);
    console.log(`🎨 Image Type: ${mimeType}`);

    // Encode image to base64
    console.log('\n🔄 Step 1: Encoding image to base64...');
    const base64Content = encodeImageToBase64(imagePath);
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
            type: 'image_url',
            image_url: `data:${mimeType};base64,${base64Content}`,
        },
        include_image_base64: true,
    };

    console.log('\n🚀 Step 2: Sending to Mistral Document AI...');
    console.log(`🔗 Endpoint: ${azureEndpoint}`);
    console.log(`📸 Processing as: ${mimeType}`);

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
    console.log('🎯 DEMO SCENARIO: Recipe Image to Shopping List');
    console.log('='.repeat(60));
    console.log('Problem: I have a recipe image and want to:');
    console.log('  • Extract the text accurately');
    console.log('  • Generate a shopping list');
    console.log('  • Get cooking parameters');
    console.log('\nSolution: AI-powered image processing!\n');

    let imagePath = '';

    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
        console.log('📁 Please place your image file in the project directory.');
        console.log(`📂 Current directory: ${process.cwd()}`);
        console.log('\n🔍 Available image files:');

        // Look for common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const files = fs.readdirSync('.');
        const imageFiles = files.filter((f) =>
            imageExtensions.some((ext) => f.toLowerCase().endsWith(ext))
        );

        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                console.log(`  🖼️  ${file}`);
            }
            imagePath = imageFiles[0];
            console.log(`\n🎯 Using: ${imagePath}`);
        } else {
            console.log('  ❌ No image files found');
            console.log('  📝 Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP');
            return;
        }
    }

    // Process the image
    const result = await processImageWithMistral(imagePath);

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
    console.log("▶️  Next: Run 'pnpm start:shopping-list-image' to see the magic!");
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
