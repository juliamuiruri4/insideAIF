import os
import sys
from typing import List, Dict

from openai import AzureOpenAI
from dotenv import load_dotenv


def main():
    """Run an interactive, multi-turn console chat using Azure OpenAI model router.

    - Maintains conversation history (system + rolling window of recent turns)
    - Sends full history each turn for context
    - Type 'exit' or 'quit' to end the session
    """

    load_dotenv()

    subscription_key = os.getenv("subscription_key")
    endpoint = os.getenv("endpoint")
    deployment = os.getenv("deployment")
    api_version = os.getenv("api_version")

    # System prompt can be customized via env
    system_prompt = os.getenv("SYSTEM_PROMPT", "You are a helpful assistant.")

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=subscription_key,
    )

    # Conversation state: always begin with system message
    messages: List[Dict[str, str]] = [
        {"role": "system", "content": system_prompt},
    ]

    # Controls how many turns (user+assistant pairs) to keep in context
    max_history_turns = int(os.getenv("MAX_HISTORY_TURNS", "12"))

    print("Interactive chat started. Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye.")
            break

        # Append user turn
        messages.append({"role": "user", "content": user_input})

        # Trim history to keep context small while preserving the system message
        trimmed = trim_history(messages, max_history_turns=max_history_turns)

        # Call the router deployment
        response = client.chat.completions.create(
            messages=trimmed,
            max_tokens=int(os.getenv("MAX_OUTPUT_TOKENS", "10000")),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
            top_p=float(os.getenv("TOP_P", "0.95")),
            frequency_penalty=float(os.getenv("FREQ_PENALTY", "0.0")),
            presence_penalty=float(os.getenv("PRES_PENALTY", "0.0")),
            model=deployment,
        )

        assistant_message = response.choices[0].message.content or ""
        routed_model = getattr(response, "model", "<unknown>")

        print(f"\n[model: {routed_model}]\nAssistant: {assistant_message}\n")

        # Append assistant turn to the full history
        messages.append({"role": "assistant", "content": assistant_message})


def trim_history(messages: List[Dict[str, str]], max_history_turns: int) -> List[Dict[str, str]]:
    """Keep system message plus the last N user/assistant turns.

    messages: full history including system at index 0
    max_history_turns: number of recent user+assistant pairs to retain
    """
    if not messages:
        return messages

    # Always preserve the first message if it is the system message
    head = messages[0:1]
    body = messages[1:]

    # Count pairs in body. We'll keep the last 2*max_history_turns messages
    keep = max_history_turns * 2
    if len(body) <= keep:
        return head + body
    else:
        return head + body[-keep:]


if __name__ == "__main__":
    main()