from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.schemas.task import DownloadRequest
from backend.workers.download_flow import video_download_flow
from prefect.deployments import run_deployment

router = APIRouter()

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
