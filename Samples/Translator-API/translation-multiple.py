import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate"
SUBSCRIPTION_KEY = os.getenv("SUBSCRIPTION_KEY")
REGION = os.getenv("REGION")

def translate_text(text, from_lang, targets):
    headers = {
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "Ocp-Apim-Subscription-Region": REGION,
        "Content-Type": "application/json",
    }
    
    params = {"api-version": "2025-05-01-preview"}

    body = [{
        "text": text,
        "language": from_lang,
        "targets": targets
    }]
    
    response = requests.post(ENDPOINT, params=params, headers=headers, json=body, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    return data

if __name__ == "__main__":
    targets = [
        {
            "language": "fr",
            "deploymentName": "gpt-4o"
        },
        {
            "language": "es"
        }
    ]
    
    # Translate text to multiple targets
    result = translate_text("I have a problem with my order", "en", targets)
    
    # Print the full JSON response
    print(json.dumps(result, indent=2, ensure_ascii=False))


