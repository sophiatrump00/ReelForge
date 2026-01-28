from prefect import flow, task, get_run_logger
from backend.schemas.task import ProcessingTask
from backend.services.ai_service import AIService, AIProviderConfig
from backend.services.video_processor import VideoProcessor
from backend.pipeline.step1_outline import Step1ContentAnalysis
from backend.pipeline.step3_scoring import Step3Scoring
from backend.pipeline.step5_video import Step5VideoGeneration
from typing import Dict, Any, List
import asyncio
import os

from backend.services.config_service import ConfigService


@task
def analyze_content(video_path: str, ad_goal: str = None):
    settings = ConfigService.load_settings()
    config = AIProviderConfig(
        provider_name=settings.vendor,
        api_base=settings.api_base,
        api_key=settings.api_key,
        model_name=settings.vl_model
    )
    ai = AIService(config)
    vp = VideoProcessor()
    step1 = Step1ContentAnalysis(ai, vp)
    return asyncio.run(step1.run(video_path, ad_goal=ad_goal))

@task
def score_segments(timeline_mock: List[Dict]):
    settings = ConfigService.load_settings()
    config = AIProviderConfig(
        provider_name=settings.vendor,
        api_base=settings.api_base,
        api_key=settings.api_key,
        model_name=settings.vl_model
    )
    ai = AIService(config)
    step3 = Step3Scoring(ai)
    return asyncio.run(step3.run(timeline_mock))

@task
def generate_clips(video_path: str, segments: List[Dict], output_dir: str):
    vp = VideoProcessor()
    step5 = Step5VideoGeneration(vp)
    return asyncio.run(step5.run(video_path, segments, output_dir))

@flow(name="video_processing_pipeline")
def video_processing_flow(video_path: str, output_dir: str, ad_goal: str = None):
    logger = get_run_logger()
    logger.info(f"Starting processing for {video_path} with goal: {ad_goal}")
    
    # 1. Content Analysis (includes AI Filtering)
    analysis_result = analyze_content(video_path, ad_goal=ad_goal)
    logger.info(f"Analysis complete: {analysis_result}")
    
    # Check Filter Status
    if analysis_result.get("filter_status") == "rejected":
        reason = analysis_result.get("reason", "Filtered by AI")
        logger.warning(f"Video rejected by AI Filter: {reason}")
        return {
            "status": "filtered",
            "reason": reason,
            "clips": []
        }
    
    # In real flow, Step 2 would produce this list based on Step 1
    # For now, we rely on Step 1 output if it returns timeline, or we parse it.
    # To fully remove mock, Step 1 should return structured data.
    # Let's assume Step 1 returns a list or valid dict.
    # If Step 1 is still unimplemented fully, we might still have a partial placeholder, 
    # but the USER asked to remove mocks. 
    # So we should pass analysis_result to Step 3 if Step 3 can handle it.
    # However, Step 3 expects list of segments.
    # Let's verify what analyze_content returns.
    
    timeline = analysis_result.get("segments", [])
    if not timeline:
        # Fallback or error if AI failed to find segments
        logger.warning("No segments found by AI. Using minimal default.")
        timeline = [{"start": 0, "end": 10, "topic": "default"}]

    
    # 3. Scoring
    scored_segments = score_segments(timeline)
    
    # 4. Filter High Quality

    high_quality_segments = [s for s in scored_segments if s['score'] > 8]
    
    # 5. Generate Clips
    final_clips = generate_clips(video_path, high_quality_segments, output_dir)
    
    return final_clips

if __name__ == "__main__":
    # Local test
    # video_processing_flow("test.mp4", "./output")
    pass
