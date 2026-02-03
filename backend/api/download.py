from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from backend.schemas.task import DownloadRequest
from backend.workers.download_flow import video_download_flow
from backend.services.batch_service import BatchService
from prefect.deployments import run_deployment
from pydantic import BaseModel

router = APIRouter()


class BatchContentRequest(BaseModel):
    content: str


@router.post("/task", status_code=202)
def create_download_task(request: DownloadRequest):
    """
    Submit a download task.
    This triggers a Prefect flow run.
    """
    try:
        # Trigger the flow run asynchronously
        state = run_deployment(name="video_download_flow/api_triggered", parameters={"request_dict": request.model_dump()}, timeout=0)
        return {"message": "Task submitted", "flow_run_id": str(state)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/direct", status_code=200)
def sync_download(request: DownloadRequest):
    """
    Synchronous download for testing (blocking).
    """
    try:
        results = video_download_flow(request.model_dump())
        return {"status": "completed", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Batch Download Endpoints ============

@router.get("/batch/content")
def get_batch_content():
    """Get batch links content from database."""
    return BatchService.get_content()


@router.post("/batch/content")
def save_batch_content(request: BatchContentRequest):
    """Save batch links content to database and sync to file."""
    try:
        return BatchService.save_content(request.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/upload")
async def upload_batch_file(file: UploadFile = File(...)):
    """Upload a links.txt file."""
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
        return BatchService.save_content(text_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/run")
def run_batch_download():
    """Run batch download using the stored links.txt."""
    try:
        data = BatchService.get_content()
        urls = BatchService.parse_links(data["content"])
        
        if not urls:
            raise HTTPException(status_code=400, detail="No valid URLs found in batch links")
        
        # Submit download tasks for each URL
        results = []
        for url in urls:
            try:
                state = run_deployment(
                    name="video_download_flow/api_triggered",
                    parameters={"request_dict": {"url": url, "is_batch": True}},
                    timeout=0
                )
                results.append({"url": url, "flow_run_id": str(state)})
            except Exception as e:
                results.append({"url": url, "error": str(e)})
        
        return {"status": "submitted", "count": len(urls), "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batch/status")
def get_batch_status():
    """Get batch links status."""
    return BatchService.get_status()


# ============ Terminal Mode ============

import asyncio
import shlex
from fastapi.responses import StreamingResponse

@router.post("/terminal")
async def run_terminal_command(request: DownloadRequest):
    """
    Execute yt-dlp command and stream output in real-time.
    Strictly limited to yt-dlp executable.
    """
    try:
        # Extract arguments
        # Frontend sends the full arg string in options['custom_args']
        args_str = ""
        if request.options and "custom_args" in request.options:
            args_str = request.options["custom_args"]
        
        # Security check: Ensure we are only running yt-dlp
        # We will NOT execute the user string directly as a shell command.
        # We will parse arguments and pass them to subprocess with executable='yt-dlp'
        
        try:
            args = shlex.split(args_str)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid command arguments: {e}")
        
        # Remove 'yt-dlp' from args if user typed it
        if args and args[0] == "yt-dlp":
            args = args[1:]
            
        program = "yt-dlp"
        
        async def iter_output():
            yield "Terminal connection established.\n"
            
            try:
                process = await asyncio.create_subprocess_exec(
                    program,
                    *args,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT,
                    cwd="/app/data"
                )
                
                yield f"Starting command: {program} {' '.join(args)}\n\n"
                
                # Stream stdout line by line
                while True:
                    line = await process.stdout.readline()
                    if not line:
                        break
                    yield line.decode('utf-8')
                
                return_code = await process.wait()
                
                if return_code == 0:
                    yield "\n\nCommand exited successfully."
                else:
                    yield f"\n\nCommand failed with exit code {return_code}."
                    
            except Exception as e:
                yield f"Error starting command: {e}\n"

        return StreamingResponse(iter_output(), media_type="text/plain")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
