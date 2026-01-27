from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class KeywordDetector:
    def __init__(self, positive_keywords: List[str], negative_keywords: List[str]):
        self.positive = positive_keywords
        self.negative = negative_keywords

    async def detect(self, text_content: str, frame_ocr_results: List[str]) -> Dict:
        """
        Detect keywords in text (transcript) and OCR results.
        Uses exact string matching for efficiency.
        """
        found_positive = []
        found_negative = []
        
        # Check transcript
        for kw in self.positive:
            if kw in text_content:
                found_positive.append(kw)
        for kw in self.negative:
            if kw in text_content:
                found_negative.append(kw)
                
        # Check OCR
        for frame_text in frame_ocr_results:
             for kw in self.positive:
                if kw in frame_text and kw not in found_positive:
                    found_positive.append(kw)
             for kw in self.negative:
                if kw in frame_text and kw not in found_negative:
                    found_negative.append(kw)
                    
        return {
            "positive_matches": found_positive,
            "negative_matches": found_negative,
            "has_risk": len(found_negative) > 0
        }
