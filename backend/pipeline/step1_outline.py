from backend.services.ai_service import AIService
from backend.services.video_processor import VideoProcessor
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class Step1ContentAnalysis:
    def __init__(self, ai_service: AIService, video_processor: VideoProcessor):
        self.ai = ai_service
        self.vp = video_processor

    async def run(self, video_path: str, ad_goal: str = None, keywords: Dict = None) -> Dict:
        """
        Extract video outline/content structure.
        Strategy: Extract frames at intervals -> AI Vision Analysis -> Summarize
        """
        # 1. Extract frames
        # Extract 5 frames distributed throughout the video
        frames = self.vp.extract_keyframes(video_path, num_frames=5)
        logger.info(f"Extracted {len(frames)} frames for analysis")
        
        # 2. AI Vision Analysis
        
        # Construct Prompt based on inputs
        base_prompt = """
        Analyze this video content based on the provided frames.
        1. Summarize the main topic.
        2. Identify key segments/chapters with estimated timestamps (start/end) based on visual changes.
        """
        
        goal_prompt = ""
        if ad_goal:
            goal_prompt = f"""
            3. Evaluate if this video aligns with the Target Ad Goal: "{ad_goal}".
               - If it aligns, set "filter_status" to "accepted".
               - If not, set "filter_status" to "rejected".
               - Provide a "reason".
            """
        
        format_prompt = """
        4. Return JSON format with keys: 
           "summary", "topic", "segments" (list of {start, end, topic}), 
           "filter_status" (accepted/rejected), "reason".
        Assume the video is roughly X minutes long and map frames to timeline.
        """
        
        full_prompt = base_prompt + goal_prompt + format_prompt
        
        try:
            analysis = await self.ai.analyze_images(frames, prompt=full_prompt)
            # Note: analyze_images returns a string (usually JSON string if requested).
            
            import json
            import re
            
            # Simple cleanup to find JSON block
            match = re.search(r'\{.*\}', analysis, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group(0))
                    
                    # Ensure filter status fields exist
                    if "filter_status" not in result:
                        result["filter_status"] = "accepted" # Default to accept if AI didn't specify
                    
                    return result
                except:
                    pass
            
            # Fallback if no valid JSON found
            return {
                "summary": analysis,
                "topics": ["auto-generated"],
                "segments": [],
                "filter_status": "accepted", # Fallback
                "reason": "Could not parse AI response"
            }
        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            return {
                "summary": "Analysis failed",
                "topics": [],
                "segments": [],
                "filter_status": "rejected",
                "reason": f"Analysis failed: {str(e)}"
            }
