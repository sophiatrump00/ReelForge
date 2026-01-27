from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class Step3Scoring:
    def __init__(self, ai_service):
        self.ai = ai_service

    async def run(self, timeline: List[Dict]) -> List[Dict]:
        """
        Score each timeline segment.
        """
        logger.info("Step 3: Scoring segments")
        # Iterate segments and ask AI to rate them based on content/rules
        scored_segments = []
        for segment in timeline:
            try:
                topic = segment.get("topic", "unknown")
                response = await self.ai.generate_text(
                    prompt=f"Rate the viral potential of a video segment about '{topic}' on a scale of 0 to 10. Return ONLY the number.",
                    system_prompt="You are a viral video expert. Output a single floating point number."
                )
                import re
                match = re.search(r"[\d\.]+", response)
                if match:
                    score = float(match.group(0))
                else:
                    score = 5.0
            except Exception as e:
                logger.error(f"Scoring failed: {e}")
                score = 5.0

            scored_segments.append({
                **segment,
                "score": max(0.0, min(10.0, score))
            })
        
        return scored_segments
