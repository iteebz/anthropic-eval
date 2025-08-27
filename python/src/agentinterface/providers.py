"""LLM providers for component selection"""

import os
from typing import Optional
from .constants import DEFAULT_MODELS


async def create_llm(provider: str = "openai"):
    """Create LLM provider"""
    if provider == "openai":
        return OpenAIProvider()
    elif provider == "gemini":
        return GeminiProvider()
    elif provider == "anthropic":
        return AnthropicProvider()
    else:
        raise ValueError(f"Unknown provider: {provider}")


class OpenAIProvider:
    def __init__(self, model: Optional[str] = None):
        self.model = model or DEFAULT_MODELS["openai"]
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY not found")
    
    async def generate(self, prompt: str) -> str:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key)
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.1
            )
            
            return response.choices[0].message.content
        except ImportError:
            raise RuntimeError("pip install openai")


class GeminiProvider:
    def __init__(self, model: Optional[str] = None):
        self.model = model or DEFAULT_MODELS["gemini"] 
        self.api_key = self._get_api_key()
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not found")
    
    def _get_api_key(self):
        """Get Gemini API key with rotation support"""
        for i in range(1, 9):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key:
                return key
        return os.getenv("GEMINI_API_KEY")
    
    async def generate(self, prompt: str) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            
            model = genai.GenerativeModel(self.model)
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=2000
                )
            )
            
            return response.text
        except ImportError:
            raise RuntimeError("pip install google-generativeai")


class AnthropicProvider:
    def __init__(self, model: Optional[str] = None):
        self.model = model or DEFAULT_MODELS["anthropic"]
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not found")
    
    async def generate(self, prompt: str) -> str:
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            
            response = await client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text
        except ImportError:
            raise RuntimeError("pip install anthropic")