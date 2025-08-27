# Mistral Document AI

![Freeform Tool Calling](../../Images/thumbnail-freeform-tool-calling.png)

Freeform tool calling in GPT-5 enables the model to send raw text payloads like Python scripts, SQL queries, or configuration files directly to external tools without needing to wrap them in structured JSON—eliminating rigid JSON schemas and reducing integration overhead. In this episode, April shows you how the model executes model-generated SQL to compute results, routes the output to Python for formatting and visualization, and returns reproducible artifacts (CSVs, charts) all using natural language input.

Try it yourself in Azure AI Foundry and start parsing documents and images: [ai.azure.com](https://ai.azure.com)

Learn more about Mistral Document AI: [aka.ms/insideAIF/freeform-tool-calling](https://aka.ms/insideAIF/freeform-tool-calling)

## Prerequisites

- An [Azure AI Foundry](https://ai.azure.com) project

## Run the Sample

1. Navigate to the folder: `cd Samples/Freeform-Tool-Calling`
1. Install dependencies: `pip install -r requirements.txt`
1. Set up environment variables: `copy .env.example .env`
1. Run the script: `python freeform-tool-calling.py`