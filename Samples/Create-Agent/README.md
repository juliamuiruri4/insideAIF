# Create an Agent with Microsoft Foundry models (Python)

![Create an Agent with Microsoft Foundry models (Python)](../../Images/thumbnail-create-agent-python.png)

Learn how to create an AI Agent with deployed Microsoft Foundry models using Python in Visual Studio Code.

Try it yourself in Microsoft Foundry: [ai.azure.com](https://ai.azure.com)

## Prerequisites

- A [Microsoft Foundry](https://ai.azure.com) project

## Run the Samples

### Create an Agent

1. Navigate to the folder: `cd Samples/Create-Agent`
1. Install dependencies:
    - pip install azure-ai-projects --pre
    - pip install openai azure-identity python-dotenv
1. Use the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=winget) command `az login` or `az login --use-device-code` to authenticate.
1. Set up environment variables: `copy .env.example .env`
1. Run the script: `python create-agent.py`

### Chat with an Agent

> [!NOTE]
> Running the `create-agent.py` file is a prerequisite for the `chat-with-agent.py` file since the agent's name from the `create-agent.py` file is referenced in the `chat-with-agent.py` file. However, if you have an existing agent that you'd like to use instead, replace the value for the `AZURE_AI_FOUNDRY_AGENT_NAME` environment variable with your agent's name.

1. Navigate to the folder: `cd Samples/Create-Agent`
1. Install dependencies:
    - pip install azure-ai-projects --pre
    - pip install openai azure-identity python-dotenv
1. Use the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=winget) command `az login` or `az login --use-device-code` to authenticate.
1. Set up environment variables: `copy .env.example .env`
1. Run the script: `python chat-with-agent.py`