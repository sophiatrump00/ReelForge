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
    # In a production setup, we would execute a deployment.
    # For now, we can run the flow directly (which runs locally or submits if configured)
    # Or better, use run_deployment if we have one deployed.
    
    # Simpler approach for this phase: run as subflow or background task if no deployment yet
    # Ideally: state = video_download_flow.delay(request.model_dump())
    
    # We'll use Prefect's .submit() or .delay() mechanics which depend on the runner.
    # Since we are setting up a worker, we should ideally CREATE a deployment first.
    # But to keep it functional "out of the box" without manual CLI deployment steps first:
    
    try:
        # This will run immediately in background if using TaskRunner, 
        # or submit to API if configured properly.
        # For simplicity in this step, we'll let it handle via sub-process or use deployment later.
        
        # NOTE: To use Workers properly, we need to create a Deployment. 
        # But for the API to just "work" now:
        
        # state = video_download_flow.to_deployment(name="api_triggered").run_later(parameters={"request_dict": request.model_dump()})
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

