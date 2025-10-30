# Azure AI Translator API (Public Preview)

![Azure AI Translator API](/Images/thumbnail-translator-API.png)

The Azure AI Foundry Translator API (Public Preview) enables you to translate text leveraging neural machine translation (NMT) or large language model translation (LLM). In this episode, April shows you how to translate a conversation between an English speaking customer support agent and a French speaking customer, accommodating for both tone and gender.

Try it yourself in Azure AI Foundry and start translating with LLMs: [ai.azure.com](https://ai.azure.com)

Learn more about the Azure AI Translator API: [aka.ms/insideAIF/translator-API](https://aka.ms/insideAIF/translator-API)
Configure your Azure AI Foundry resource: [aka.ms/insideAIF/configure-Azure-resources](https://aka.ms/insideAIF/configure-Azure-resources)

## Prerequisites

- An Azure AI Foundry resource created in the [Azure portal](https://portal.azure.com). Review the [Configure your Azure AI Foundry resource](https://aka.ms/insideAIF/configure-Azure-resources) document for guidance.
- A `GPT-4o` or `GPT-4o-mini` deployment

## Run the Samples

### Basic Neural Machine Translation

1. Navigate to the folder: `cd Samples/Translator-API/Python`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. Run the script: `python translation-nmt.py`

### Basic Large Language Model Translation

1. Navigate to the folder: `cd Samples/Translator-API/Python`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. In the `translate_text` function call, replace `your-gpt-model-deployment` with your model deployment name.
1. Run the script: `python translation-llm.py`

### LLM Translation with Tone

1. Navigate to the folder: `cd Samples/Translator-API/Python`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. In the `translate_text` function call, replace `your-gpt-model-deployment` with your model deployment name.
1. Run the script: `python translation-tone.py`

### LLM Translation with Gender

1. Navigate to the folder: `cd Samples/Translator-API/Python`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. In the `translate_text` function call, replace `your-gpt-model-deployment` with your model deployment name.
1. Run the script: `python translation-gender.py`

### NMT and LLM Translation with Multiple Languages

1. Navigate to the folder: `cd Samples/Translator-API/Python`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. In the `targets` list, replace `your-gpt-model-deployment` with your model deployment name.
1. Run the script: `python translation-multiple.py`