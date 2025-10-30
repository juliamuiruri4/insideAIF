import fs from 'fs';

type DocumentAIResult = {
    usage_info: {
        pages_processed: number;
        doc_size_bytes: number;
    };
    pages: Array<{
        markdown: string;
    }>;
};

type RecipeData = {
    title: string;
    ingredients: string[];
    instructions: string[];
    ingredient_count: number;
    step_count: number;
};

type CookingInfo = {
    temperatures: string[];
    cooking_times: string[];
};

function loadDocumentAIResult(filePath: string): DocumentAIResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

function extractRecipeComponents(markdownText: string): RecipeData {
    console.log('🔄 Step 1: Parsing recipe structure...');
    console.log('📄 DEBUG: Analyzing document structure...');

    // Show first 500 characters
    console.log('📝 First 500 chars of document:');
    console.log('-'.repeat(40));
    console.log(markdownText.substring(0, 500));
    console.log('-'.repeat(40));

    // Extract title
    const titlePatterns = [
        /^# (.+)/m,                  // Standard markdown
        /^\*\*(.+)\*\*/m,            // Bold text
        /^(.+)\n=+/m,                // Underlined with =
        /^(.+)\n-+/m,                // Underlined with -
    ];

    let title = 'Unknown Recipe';
    for (const pattern of titlePatterns) {
        const titleMatch = markdownText.match(pattern);
        if (titleMatch) {
            title = titleMatch[1].trim();
            break;
        }
    }

    console.log(`📝 Found recipe: ${title}`);

    // Extract ingredients
    const ingredientsPatterns = [
        /## Ingredients\n\n(.*?)\n\n/s,        // Current pattern
        /## Ingredients\n(.*?)\n\n/s,          // Single newline
        /# Ingredients\n\n(.*?)\n\n/s,         // Single #
        /# Ingredients\n(.*?)\n\n/s,           // Single # + single newline
        /\*\*Ingredients\*\*\n\n(.*?)\n\n/s,   // Bold
        /\*\*Ingredients\*\*\n(.*?)\n\n/s,     // Bold + single newline
        /Ingredients\n\n(.*?)\n\n/s,           // No header formatting
        /Ingredients\n(.*?)\n\n/s,             // No header + single newline
    ];

    let ingredientsText = '';
    for (const pattern of ingredientsPatterns) {
        const ingredientsSection = markdownText.match(pattern);
        if (ingredientsSection) {
            ingredientsText = ingredientsSection[1];
            console.log(`✅ Found ingredients section with pattern: ${pattern}`);
            break;
        }
    }

    const ingredients: string[] = [];
    if (ingredientsText) {
        console.log('📝 Raw ingredients text:');
        console.log(ingredientsText.length > 200 ? ingredientsText.substring(0, 200) + '...' : ingredientsText);

        const ingredientLines = ingredientsText.split('\n');
        for (const line of ingredientLines) {
            const trimmedLine = line.trim();
            if (trimmedLine && /^[-•*]/.test(trimmedLine)) {
                const cleanIngredient = trimmedLine.replace(/^[-•*]\s*/, '').trim();
                if (cleanIngredient) {
                    ingredients.push(cleanIngredient);
                }
            }
        }
    } else {
        console.log('❌ No ingredients section found');
    
        console.log('🔍 Available sections:');
        const sections = markdownText.match(/^(#{1,3}.*|.*\n[=-]+)/gm) || [];
        for (const section of sections.slice(0, 10)) {
            console.log(`  • ${section.trim()}`);
        }
    }

    console.log(`🥗 Found ${ingredients.length} ingredients`);

    // Extract instructions
    const instructionsPatterns = [
        /Instructions\n\n(.*)/s,              // Current pattern
        /Instructions\n(.*)/s,                // Single newline
        /## Instructions\n\n(.*)/s,           // With ##
        /## Instructions\n(.*)/s,             // With ## + single newline
        /# Instructions\n\n(.*)/s,            // With #
        /# Instructions\n(.*)/s,              // With # + single newline
        /\*\*Instructions\*\*\n\n(.*)/s,      // Bold
        /\*\*Instructions\*\*\n(.*)/s,        // Bold + single newline
        /Directions\n\n(.*)/s,                // Alternative name
        /Directions\n(.*)/s,                  // Alternative name + single newline
        /Method\n\n(.*)/s,                    // Alternative name
        /Method\n(.*)/s,                      // Alternative name + single newline
    ];

    let instructionsText = '';
    for (const pattern of instructionsPatterns) {
        const instructionsMatch = markdownText.match(pattern);
        if (instructionsMatch) {
            instructionsText = instructionsMatch[1];
            console.log(`✅ Found instructions section with pattern: ${pattern}`);
            break;
        }
    }

    const instructions: string[] = [];
    if (instructionsText) {
        console.log('📝 Raw instructions text:');
        console.log(instructionsText.length > 200 ? instructionsText.substring(0, 200) + '...' : instructionsText);

        // Split by numbered steps
        let steps = instructionsText.split(/\n\d+\.\s+/).filter((s) => s.trim());

        // If no numbered steps found, try splitting by paragraphs
        if (steps.length <= 1) {
            steps = instructionsText.split('\n\n').filter((p) => p.trim());
        }

        instructions.push(...steps.map((s) => s.trim()));
    } else {
        console.log('❌ No instructions section found');
    }

    console.log(`👨‍🍳 Found ${instructions.length} cooking steps`);

    return {
        title,
        ingredients,
        instructions,
        ingredient_count: ingredients.length,
        step_count: instructions.length,
    };
}

function createShoppingList(recipeData: RecipeData): string[] {
    console.log('\n🛒 Step 2: Generating smart shopping list...');

    const shoppingList: string[] = [];
    for (const ingredient of recipeData.ingredients) {
        let cleanIngredient = ingredient.replace(/^[\d\s/.-]+/, ''); // Remove numbers/measurements
        cleanIngredient = cleanIngredient.replace(/\([^)]*\)/g, ''); // Remove parenthetical notes
        cleanIngredient = cleanIngredient.split(',')[0]; // Take first part before comma
        const cleanItem = cleanIngredient.trim();
        if (cleanItem) {
            shoppingList.push(cleanItem);
            console.log(`  📋 ${ingredient} → ${cleanItem}`);
        }
    }

    return shoppingList;
}

function extractCookingTempsAndTimes(markdownText: string): CookingInfo {
    console.log('\n🌡️ Step 3: Extracting cooking parameters...');

    // Extract temperatures
    const tempPatterns = [
        /\$\\mathbf\{(\d+)\}\^\{\\circ\}\s*\\mathbf\{([FC])\}/g,  // LaTeX format
        /(\d+)°([FC])/g,                                           // Simple format: 425°F
        /(\d+)\s*degrees?\s*([FC])/gi,                            // Text format: 425 degrees F
        /(\d+)\s*deg\s*([FC])/gi,                                 // Abbreviated: 425 deg F
    ];

    const temperatures: string[] = [];
    for (const pattern of tempPatterns) {
        let tempMatch;
        while ((tempMatch = pattern.exec(markdownText)) !== null) {
            temperatures.push(`${tempMatch[1]}°${tempMatch[2]}`);
        }
    }

    // Extract times
    const timePatterns = [
        /(\d+(?:\s*hour[s]?)?\s*\d*\s*minutes?)/gi,  // Current pattern
        /(\d+:\d+)/g,                                 // Time format: 1:15
        /(\d+\s*hrs?\s*\d*\s*mins?)/gi,              // Abbreviated: 1 hr 15 mins
        /(\d+\s*h\s*\d*\s*m)/gi,                     // Very abbreviated: 1h 15m
    ];

    const times: string[] = [];
    for (const pattern of timePatterns) {
        const timeMatches = markdownText.match(pattern) || [];
        times.push(...timeMatches);
    }

    for (const temp of temperatures) {
        console.log(`  🌡️  Temperature: ${temp}`);
    }
    for (const cookingTime of times) {
        console.log(`  ⏰ Time: ${cookingTime}`);
    }

    return {
        temperatures,
        cooking_times: times,
    };
}

function generateSummary(recipeData: RecipeData, tempsTime: CookingInfo): string {
    return `
🍽️  Recipe Summary: ${recipeData.title}
   • ${recipeData.ingredient_count} ingredients needed
   • ${recipeData.step_count} cooking steps
   • Cooking temperatures: ${tempsTime.temperatures.length > 0 ? tempsTime.temperatures.join(', ') : 'None detected'}
   • Estimated times: ${tempsTime.cooking_times.length > 0 ? tempsTime.cooking_times.join(', ') : 'None detected'}
`;
}

export async function main(): Promise<void> {
    console.log('🎯 DEMO PHASE 2: Smart Recipe Processing (DEBUG VERSION)');
    console.log('='.repeat(60));
    console.log('Input: Raw Document AI JSON');
    console.log('Output: Structured recipe data + shopping list\n');

    try {
        // Load the Document AI result
        console.log('📂 Loading Document AI results...');
        const docResult = loadDocumentAIResult('document_ai_result.json');

        // Combine all page content
        let fullContent = '';
        for (const page of docResult.pages) {
            fullContent += page.markdown + '\n\n';
        }

        console.log(`📄 Total content length: ${fullContent.length} characters`);

        // Extract structured recipe data
        const recipe = extractRecipeComponents(fullContent);
        const tempsTime = extractCookingTempsAndTimes(fullContent);
        const shoppingList = createShoppingList(recipe);

        // Generate summary
        const summary = generateSummary(recipe, tempsTime);

        // Display results with demo flair
        console.log('\n' + '='.repeat(60));
        console.log('🎉 PROCESSING COMPLETE!');
        console.log('='.repeat(60));

        console.log(summary);

        console.log(`\n🛒 SHOPPING LIST (${shoppingList.length} items):`);
        console.log('-'.repeat(30));
        for (let i = 0; i < shoppingList.length; i++) {
            console.log(`${(i + 1).toString().padStart(2)}. ${shoppingList[i]}`);
        }

        console.log(`\n📋 DETAILED INGREDIENTS (${recipe.ingredients.length}):`);
        console.log('-'.repeat(30));
        for (const ingredient of recipe.ingredients) {
            console.log(`   • ${ingredient}`);
        }

        console.log(`\n👨‍🍳 COOKING STEPS (${recipe.instructions.length}):`);
        console.log('-'.repeat(30));
        for (let i = 0; i < recipe.instructions.length; i++) {
            const cleanStep = recipe.instructions[i].replace(/\n/g, ' ').trim();
            const preview = cleanStep.length > 80 ? cleanStep.substring(0, 80) + '...' : cleanStep;
            console.log(`${(i + 1).toString().padStart(2)}. ${preview}`);
        }

        // Save structured data
        const outputData = {
            recipe,
            cooking_info: tempsTime,
            shopping_list: shoppingList,
            original_pages: docResult.pages.length,
            document_size: docResult.usage_info.doc_size_bytes,
        };

        fs.writeFileSync('structured_recipe_data.json', JSON.stringify(outputData, null, 2), 'utf-8');

        console.log('\n💾 Structured data saved to: structured_recipe_data.json');
        console.log('\n🎯 DEMO COMPLETE! Image → Shopping List in 2 steps!');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.log('❌ Error: document_ai_result.json not found');
            console.log("▶️  Please run 'npm run start:docai-image' first!");
        } else {
            console.error(`❌ Error: ${err instanceof Error ? err.message : err}`);
        }
    }
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
