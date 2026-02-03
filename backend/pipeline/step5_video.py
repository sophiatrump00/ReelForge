import logging
import os
from typing import List, Dict, Any
from backend.services.video_processor import VideoProcessor

logger = logging.getLogger(__name__)

class Step5VideoGeneration:
    def __init__(self, video_processor: VideoProcessor):
        self.vp = video_processor

    async def run(self, video_path: str, segments: List[Dict], output_dir: str) -> List[str]:
        """
        Generate video clips based on selected segments.
        """
        logger.info(f"Step 5: Generating clips for {len(segments)} segments")
        
        generated_clips = []
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        for i, seg in enumerate(segments):
            start = seg.get('start')
            end = seg.get('end')
            
            if start is None or end is None:
                logger.warning(f"Skipping segment {i} due to missing start/end times: {seg}")
                continue
                
            # filename
            # sanitized topic or just index
            topic = seg.get('topic', 'clip').replace(' ', '_')
            filename = f"clip_{i}_{topic}.mp4"
            output_path = os.path.join(output_dir, filename)
            
            logger.info(f"Cutting clip {i}: {start}-{end} -> {output_path}")
            
            try:
                # Call VideoProcessor to cut
                # Assuming cut_video is synchronous or we wrap it if it was async?
                # VideoProcessor methods seem synchronous (check previous view_file). 
                # They use ffmpeg directly.
                self.vp.cut_video(video_path, start, end, output_path)
                generated_clips.append(output_path)
            except Exception as e:
                logger.error(f"Failed to generate clip {i}: {e}")
                
        return generated_clips
