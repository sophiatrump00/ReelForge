from openai import OpenAI
from typing import List, Dict, Optional, Union
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class AIProviderConfig(BaseModel):
    provider_name: str
    api_base: str
    api_key: str
    model_name: str
    
class AIService:
    def __init__(self, config: AIProviderConfig):
        self.config = config
        self.client = OpenAI(
            base_url=config.api_base,
            api_key=config.api_key
        )

    def analyze_image(self, image_url: str, prompt: str) -> str:
        """
        Analyze an image (VL model)
        """
        try:
            response = self.client.chat.completions.create(
                model=self.config.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            raise e

    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        """
        Generate text (LLM model)
        """
        try:
            response = self.client.chat.completions.create(
                model=self.config.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
             logger.error(f"AI Generation failed: {e}")
             raise e
