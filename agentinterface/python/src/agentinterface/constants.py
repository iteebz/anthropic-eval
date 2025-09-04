"""Model constants and configuration"""

DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "gemini": "gemini-2.5-flash-lite",
    "anthropic": "claude-3-5-haiku-20241022",
}

DEFAULT_PROVIDERS = {"llm": "openai", "embedder": "openai"}

DEFAULT_PORTS = {"server": 8228}
