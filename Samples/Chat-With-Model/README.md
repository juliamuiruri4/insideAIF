# Chat with a deployed Microsoft Foundry model (Python)

![Chat with a deployed Microsoft Foundry model (Python)](../../Images/thumbnail-chat-with-model.png)

Learn how to chat directly with deployed Microsoft Foundry models using Python in Visual Studio Code.

Try it yourself in Microsoft Foundry: [ai.azure.com](https://ai.azure.com)

## Prerequisites

- A [Microsoft Foundry](https://ai.azure.com) project

## Run the Sample

1. Navigate to the folder: `cd Samples/Chat-With_Model`
1. Install dependencies:
    - pip install azure-ai-projects --pre
    - pip install openai azure-identity python-dotenv
1. Use the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=winget) command `az login` or `az login --use-device-code` to authenticate.
1. Set up environment variables: `copy .env.example .env`
1. Run the script: `python chat-with-model.py`