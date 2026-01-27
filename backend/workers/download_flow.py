from prefect import flow, task, get_run_logger
from backend.services.downloader import VideoDownloader
from backend.schemas.task import DownloadRequest
from typing import Dict, Any, List
import os

@task(name="download_video_task", retries=3, retry_delay_seconds=10)
def download_video_task(request: DownloadRequest) -> List[Dict]:
    logger = get_run_logger()
    logger.info(f"Starting download for URL: {request.url}")
    
    downloader = VideoDownloader(
        cookies_path=request.cookies_path
    )
    
    # Progress hook to log progress
    def progress_hook(d):
        if d['status'] == 'downloading':
            try:
                p = d.get('_percent_str', '0%').replace('%','')
                logger.info(f"Progress: {p}%")
            except:
                pass
        elif d['status'] == 'finished':
            logger.info("Download finished, post-processing...")

    try:
        results = downloader.download(
            url=request.url,
            options=request.options,
            progress_hook=progress_hook
        )
        logger.info(f"Successfully downloaded {len(results)} videos")
        return results
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        raise e

@flow(name="video_download_flow")
def video_download_flow(request_dict: Dict):
    # Convert dict back to model if needed or pass fields
    # Prefect serialization handles dicts well
    
    # Normally we might save task state to DB here
    
    request = DownloadRequest(**request_dict)
    results = download_video_task(request)
    
    return results

if __name__ == "__main__":
    # Local test
    video_download_flow({
        "url": "https://www.tiktok.com/@example/video/123", 
        "options": {"max_downloads": 1}
    })
