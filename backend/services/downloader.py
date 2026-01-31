import yt_dlp
import os
import logging
from typing import Dict, Any, Optional, List, Callable

logger = logging.getLogger(__name__)

class VideoDownloader:
    def __init__(self, output_dir: str = "/app/data/raw", cookies_path: Optional[str] = None, proxy: Optional[str] = None):
        self.output_dir = output_dir
        self.cookies_path = cookies_path
        self.proxy = proxy

    def download(self, 
                 url: str, 
                 options: Optional[Dict[str, Any]] = None, 
                 progress_hook: Optional[Callable] = None) -> List[Dict]:
        """
        Download video(s) from a URL using yt-dlp.
        
        Args:
            url: The URL to download from (video or channel/user).
            options: Additional yt-dlp options.
            progress_hook: Callback function for progress updates.
        
        Returns:
            List of downloaded video information.
        """
        
        # Default options
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',  # Download best quality
            'outtmpl': f'{self.output_dir}/%(uploader)s/%(upload_date)s_%(id)s.%(ext)s',
            'no_warnings': True,
            'ignoreerrors': True, # Skip errors in playlist
            'quiet': False,
            'writethumbnail': True, # Save thumbnail
            'writeinfojson': True,  # Save metadata
        }

        # Add cookies if provided
        if self.cookies_path and os.path.exists(self.cookies_path):
            ydl_opts['cookiefile'] = self.cookies_path
            
        # Add proxy if provided
        if self.proxy:
            ydl_opts['proxy'] = self.proxy

            
        # Merge user options
        if options:
            ydl_opts.update(options)

        # Add progress hook
        if progress_hook:
            ydl_opts['progress_hooks'] = [progress_hook]

        results = []
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract info first to get metadata
                logger.info(f"Extracting info for {url}")
                info = ydl.extract_info(url, download=True)
                
                # Handle playlist vs single video
                if 'entries' in info:
                    # Playlist/Channel
                    for entry in info['entries']:
                        if entry:
                            results.append(self._process_entry(entry))
                else:
                    # Single video
                    results.append(self._process_entry(info))
                    
        except Exception as e:
            logger.error(f"Error downloading {url}: {str(e)}")
            raise e
            
        return results

    def _process_entry(self, entry: Dict) -> Dict:
        """Process info dict into a standardized format"""
        # Determine actual filename (yt-dlp usually adds it to '_filename' key in hooks, 
        # but in extract_info it might be 'requested_downloads')
        filepath = entry.get('requested_downloads', [{}])[0].get('filepath')
        # If not found there, try to construct likely path or check other keys
        # This part depends on yt-dlp version, checking 'filename' is safer if available
        if not filepath:
             filepath = entry.get('filename') # Sometimes populated

        return {
            'id': entry.get('id'),
            'title': entry.get('title'),
            'uploader': entry.get('uploader'),
            'duration': entry.get('duration'),
            'view_count': entry.get('view_count'),
            'like_count': entry.get('like_count'),
            'upload_date': entry.get('upload_date'),
            'filepath': filepath,
            'thumbnail': entry.get('thumbnail'),
            'webpage_url': entry.get('webpage_url'),
            'meta_platform': 'tiktok' if 'tiktok' in entry.get('webpage_url', '') else 'other'
        }
