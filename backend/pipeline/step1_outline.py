from backend.services.ai_service import AIService
from backend.services.video_processor import VideoProcessor
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class Step1ContentAnalysis:
    def __init__(self, ai_service: AIService, video_processor: VideoProcessor):
        self.ai = ai_service
        self.vp = video_processor

    async def run(self, video_path: str) -> Dict:
        """
        Extract video outline/content structure.
        Strategy: Extract frames at intervals -> AI Vision Analysis -> Summarize
        """
        # 1. Extract frames
        # Extract 5 frames distributed throughout the video
        frames = self.vp.extract_keyframes(video_path, num_frames=5)
        logger.info(f"Extracted {len(frames)} frames for analysis")
        
        # 2. AI Vision Analysis
        prompt = """
        Analyze this video content based on the provided frames.
        1. Summarize the main topic.
        2. Identify key segments/chapters with estimated timestamps (start/end) based on visual changes.
        3. Return JSON format with keys: "summary", "topic", "segments" (list of {start, end, topic}).
        Assume the video is roughly X minutes long and map frames to timeline.
        """
        
        try:
            analysis = await self.ai.analyze_images(frames, prompt=prompt)
            # Note: analyze_images returns a string (usually JSON string if requested).
            # We might need to parse it. For now, we assume AI follows instruction or we wrap it in a struct.
            # Ideally, we should parse the JSON from 'analysis'.
            
            # For robustness, we return the raw text if parsing fails, or try to parse
            import json
            import re
            
            # Simple cleanup to find JSON block
            match = re.search(r'\{.*\}', analysis, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group(0))
                    return result
                except:
                    pass
            
            # Fallback if no valid JSON found
            return {
                "summary": analysis,
                "topics": ["auto-generated"],
                "segments": []
            }
        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            return {
                "summary": "Analysis failed",
                "topics": [],
                "segments": []
            }
