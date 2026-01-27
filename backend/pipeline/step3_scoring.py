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
            # score = self.ai.score_segment(segment)
            score = 8.5 # Placeholder
            scored_segments.append({
                **segment,
                "score": score
            })
        
        return scored_segments
