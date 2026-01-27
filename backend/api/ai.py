from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from backend.services.ai_service import AIService, AIProviderConfig
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class AIConfigTestRequest(BaseModel):
    api_key: str
    api_base: str
    vendor: str
    vl_model: str

@router.post("/test")
async def test_ai_connection(request: AIConfigTestRequest):
    """
    Test connection to the AI provider
    """
    try:
        config = AIProviderConfig(
            provider_name=request.vendor,
            api_base=request.api_base,
            api_key=request.api_key,
            model_name=request.vl_model
        )
        service = AIService(config)
        
        # Try a simple text generation to verify credentials
        # Using a very short prompt to minimize cost and latency
        response = service.generate_text(
            prompt="Hello", 
            system_prompt="Reply with 'Hi' only."
        )
        
        return {"status": "success", "message": "Connection successful", "response": response}
    except Exception as e:
        logger.error(f"AI Connection Test Failed: {str(e)}")
        # Return 200 with error details so frontend can display it nicely, OR 400
        # Returning 400 is semantically better for "Bad Request" (invalid creds) configuration
        # But connection error might be 500.
        # Let's return 400 for logic/auth errors mostly.
        raise HTTPException(status_code=400, detail=str(e))
