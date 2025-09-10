import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate"
SUBSCRIPTION_KEY = os.getenv("SUBSCRIPTION_KEY")
REGION = os.getenv("REGION")

def translate_text(text, from_lang, to_lang, model_deployment, translation_gender):
    headers = {
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "Ocp-Apim-Subscription-Region": REGION,
        "Content-Type": "application/json",
    }
    
    params = {"api-version": "2025-05-01-preview"}

    body = [{
        "Text": text,
        "language": from_lang,
        "targets": [{
            "language": to_lang,
            "deploymentName": model_deployment,
            "gender": translation_gender
        }]
    }]
    
    response = requests.post(ENDPOINT, params=params, headers=headers, json=body, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    return data[0]["translations"][0]["text"]

if __name__ == "__main__":
    translated_text = translate_text("Your case has been forwarded to the support supervisor, April Gittens. She will contact you today to review the situation.", "en", "fr", "gpt-4o", "male")
    print(translated_text)


