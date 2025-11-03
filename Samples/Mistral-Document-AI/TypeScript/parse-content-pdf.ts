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

    // Extract title
    const titleMatch = markdownText.match(/^# (.+)/m);
    const title = titleMatch ? titleMatch[1] : 'Unknown Recipe';
    console.log(`📝 Found recipe: ${title}`);

    // Extract ingredients
    const ingredientsSection = markdownText.match(/## Ingredients\n\n(.*?)\n\n/s);
    const ingredients: string[] = [];
    if (ingredientsSection) {
        const ingredientLines = ingredientsSection[1].split('\n');
        ingredients.push(
            ...ingredientLines
                .filter((line) => line.trim().startsWith('-'))
                .map((line) => line.replace(/^-\s*/, '').trim())
        );
    }

    console.log(`🥗 Found ${ingredients.length} ingredients`);

    // Extract instructions
    const instructionsMatch = markdownText.match(/Instructions\n\n(.*)/s);
    const instructions: string[] = [];
    if (instructionsMatch) {
        const instructionText = instructionsMatch[1];
        const steps = instructionText.split(/\n\d+\.\s+/);
        instructions.push(...steps.filter((step) => step.trim()).map((step) => step.trim()));
    }

    console.log(`👨‍🍳 Found ${instructions.length} cooking instructions`);

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
        // Remove measurements and keep just the main ingredient
        let cleanIngredient = ingredient.replace(/^[\d\s/.-]+/, ''); // Remove numbers/measurements
        cleanIngredient = cleanIngredient.replace(/\([^)]*\)/g, ''); // Remove parenthetical notes
        cleanIngredient = cleanIngredient.split(',')[0]; // Take first part before comma
        const cleanItem = cleanIngredient.trim();
        shoppingList.push(cleanItem);
        console.log(`  📋 ${ingredient} → ${cleanItem}`);
    }

    return shoppingList;
}

function extractCookingTempsAndTimes(markdownText: string): CookingInfo {
    console.log('\n🌡️ Step 3: Extracting cooking parameters...');

    // Extract temperatures
    const tempPattern = /\$\\mathbf\{(\d+)\}\^\{\\circ\}\s*\\mathbf\{([FC])\}/g;
    const temperatures: string[] = [];
    let tempMatch;
    while ((tempMatch = tempPattern.exec(markdownText)) !== null) {
        temperatures.push(`${tempMatch[1]}°${tempMatch[2]}`);
    }

    // Extract times
    const timePattern = /(\d+(?:\s*hour[s]?)?\s*\d*\s*minutes?)/gi;
    const cookingTimes = markdownText.match(timePattern) || [];

    for (const temp of temperatures) {
        console.log(`  🌡️  Temperature: ${temp}`);
    }
    for (const cookingTime of cookingTimes) {
        console.log(`  ⏰ Time: ${cookingTime}`);
    }

    return {
        temperatures,
        cooking_times: cookingTimes,
    };
}

function generateSummary(recipeData: RecipeData, tempsTime: CookingInfo): string {
    return `
🍽️  Recipe Summary: ${recipeData.title}
   • ${recipeData.ingredient_count} ingredients needed
   • ${recipeData.step_count} cooking steps
   • Cooking temperatures: ${tempsTime.temperatures.join(', ')}
   • Estimated times: ${tempsTime.cooking_times.join(', ')}
`;
}

export async function main(): Promise<void> {
    console.log('🎯 DEMO PHASE 2: Smart Recipe Processing');
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
        console.log('\n🎯 DEMO COMPLETE! PDF → Shopping List in 2 steps!');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.log('❌ Error: document_ai_result.json not found');
            console.log("▶️  Please run 'npm run start:docai-pdf' first!");
        } else {
            console.error(`❌ Error: ${err instanceof Error ? err.message : err}`);
        }
    }
}

main().catch((err) => {
    console.error('The sample encountered an error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
