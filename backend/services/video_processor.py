import ffmpeg
import os
import logging
from typing import Optional, Tuple, Dict

logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self):
        pass

    def get_video_info(self, input_path: str) -> Dict:
        try:
            probe = ffmpeg.probe(input_path)
            video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
            if not video_stream:
                raise Exception("No video stream found")
            return {
                'width': int(video_stream['width']),
                'height': int(video_stream['height']),
                'duration': float(video_stream['duration']),
                'fps': eval(video_stream['r_frame_rate'])
            }
        except ffmpeg.Error as e:
            logger.error(f"FFmpeg probe error: {e.stderr.decode('utf8')}")
            raise e

    def convert_to_format(self, 
                          input_path: str, 
                          output_path: str, 
                          target_aspect_ratio: str,
                          strategy: str = "blur_bg") -> str:
        """
        Convert video to target aspect ratio for Meta ads.
        
        Args:
            target_aspect_ratio: '1:1', '4:5', '9:16', '16:9'
            strategy: 'crop', 'blur_bg', 'pad'
        """
        
        info = self.get_video_info(input_path)
        iw = info['width']
        ih = info['height']
        
        # Calculate target dimensions
        if target_aspect_ratio == '1:1':
            target_w, target_h = 1080, 1080
        elif target_aspect_ratio == '4:5':
            target_w, target_h = 1080, 1350
        elif target_aspect_ratio == '9:16':
            target_w, target_h = 1080, 1920
        elif target_aspect_ratio == '16:9':
            target_w, target_h = 1920, 1080
        else:
            raise ValueError(f"Unsupported aspect ratio: {target_aspect_ratio}")

        try:
            stream = ffmpeg.input(input_path)
            
            if strategy == "blur_bg":
                # Create blurred background
                # 1. Scale input to cover target size (maintain aspect ratio)
                # 2. Blur it
                # 3. Overlay original video scaled to fit inside
                
                # Background: Scale to cover
                bg = stream.filter('scale', target_w, target_h, force_original_aspect_ratio='increase')
                bg = bg.filter('crop', target_w, target_h)
                bg = bg.filter('gblur', sigma=20)
                
                # Foreground: Scale to fit
                fg = stream.filter('scale', target_w, target_h, force_original_aspect_ratio='decrease')
                
                # Overlay
                out = ffmpeg.overlay(bg, fg, x='(W-w)/2', y='(H-h)/2')
                
            elif strategy == "crop":
                # Crop to fill
                out = stream.filter('scale', target_w, target_h, force_original_aspect_ratio='increase')
                out = out.filter('crop', target_w, target_h)
                
            elif strategy == "pad":
                # Pad with black bars
                out = stream.filter('scale', target_w, target_h, force_original_aspect_ratio='decrease')
                out = out.filter('pad', target_w, target_h, '(ow-iw)/2', '(oh-ih)/2')
            
            else:
                raise ValueError(f"Unknown strategy: {strategy}")

            # Audio mapping (copy audio)
            audio = stream.audio
            
            # Run ffmpeg
            pipeline = ffmpeg.output(out, audio, output_path, vcodec='libx264', acodec='aac', strict='experimental')
            pipeline.run(overwrite_output=True, quiet=True)
            
            return output_path
            
        except ffmpeg.Error as e:
            logger.error(f"FFmpeg conversion error: {e.stderr.decode('utf8')}")
            raise e

    def extract_highlight_frame(self, input_path: str, time_sec: float, output_path: str):
        """Extract a single frame as image"""
        try:
            (
                ffmpeg
                .input(input_path, ss=time_sec)
                .output(output_path, vframes=1)
                .run(overwrite_output=True, quiet=True)
            )
        except ffmpeg.Error as e:
             logger.error(f"FFmpeg frame extract error: {e.stderr.decode('utf8')}")
             raise e

    def cut_video(self, input_path: str, start: float, end: float, output_path: str):
        """Cut video segment"""
        try:
            (
                ffmpeg
                .input(input_path, ss=start, t=end-start)
                .output(output_path, c='copy')
                .run(overwrite_output=True, quiet=True)
            )
        except ffmpeg.Error as e:
             logger.error(f"FFmpeg cut error: {e.stderr.decode('utf8')}")
             raise e

    def remove_watermark(self, input_path: str, output_path: str, x: int, y: int, w: int, h: int):
        """
        Remove watermark using delogo filter.
        Requires specifying the bounding box of the watermark.
        """
        try:
            (
                ffmpeg
                .input(input_path)
                .filter('delogo', x=x, y=y, w=w, h=h)
                .output(output_path, c='a', vcodec='libx264', crf=23)
                .run(overwrite_output=True, quiet=True)
            )
        except ffmpeg.Error as e:
             logger.error(f"FFmpeg delogo error: {e.stderr.decode('utf8')}")
             raise e

    def process_audio(self, input_path: str, output_path: str, remove: bool = False, new_audio_path: Optional[str] = None):
        """
        Remove or replace audio.
        """
        try:
            inp = ffmpeg.input(input_path)
            
            if remove and not new_audio_path:
                # Remove audio (video only)
                pipeline = inp.output(output_path, vcodec='copy', an=None)
            elif new_audio_path:
                # Replace audio
                audio_inp = ffmpeg.input(new_audio_path)
                # Shortest=True ensures video doesn't extend if audio is longer, or vice versa
                pipeline = ffmpeg.output(inp.video, audio_inp.audio, output_path, vcodec='copy', acodec='aac', shortest=None)
            else:
                # No-op (copy)
                pipeline = inp.output(output_path, c='copy')

            pipeline.run(overwrite_output=True, quiet=True)
            
        except ffmpeg.Error as e:
             logger.error(f"FFmpeg audio processing error: {e.stderr.decode('utf8')}")
             raise e
