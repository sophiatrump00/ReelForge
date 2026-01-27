from typing import List, Dict
from backend.services.video_processor import VideoProcessor
import os
import logging

logger = logging.getLogger(__name__)

class ABVariantService:
    def __init__(self, video_processor: VideoProcessor, output_dir: str = "/app/data/output"):
        self.vp = video_processor
        self.output_dir = output_dir

    def generate_variants(self, input_path: str, variants_config: List[Dict]) -> List[str]:
        """
        Generate multiple variants of a video for A/B testing.
        
        Args:
            input_path: Path to source video
            variants_config: List of dicts, e.g.
                [
                    {"name": "square_crop", "ratio": "1:1", "strategy": "crop"},
                    {"name": "square_blur", "ratio": "1:1", "strategy": "blur_bg"},
                    {"name": "story_pad", "ratio": "9:16", "strategy": "pad"}
                ]
        Returns:
            List of generated file paths
        """
        results = []
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        
        for config in variants_config:
            variant_name = f"{base_name}_{config['name']}.mp4"
            output_path = os.path.join(self.output_dir, variant_name)
            
            logger.info(f"Generating variant: {variant_name} with {config}")
            try:
                self.vp.convert_to_format(
                    input_path=input_path,
                    output_path=output_path,
                    target_aspect_ratio=config['ratio'],
                    strategy=config.get('strategy', 'blur_bg')
                )
                results.append(output_path)
            except Exception as e:
                logger.error(f"Failed to generate variant {variant_name}: {e}")
                
        return results
