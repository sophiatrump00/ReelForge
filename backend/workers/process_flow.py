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

# Placeholder AI Config (should come from DB or request)
MOCK_AI_CONFIG = AIProviderConfig(
    provider_name="mock",
    api_base="http://localhost:8000",
    api_key="mock",
    model_name="mock-model"
)

@task
def analyze_content(video_path: str):
    ai = AIService(MOCK_AI_CONFIG)
    vp = VideoProcessor()
    step1 = Step1ContentAnalysis(ai, vp)
    return asyncio.run(step1.run(video_path))

@task
def score_segments(timeline_mock: List[Dict]):
    ai = AIService(MOCK_AI_CONFIG)
    step3 = Step3Scoring(ai)
    return asyncio.run(step3.run(timeline_mock))

@task
def generate_clips(video_path: str, segments: List[Dict], output_dir: str):
    vp = VideoProcessor()
    step5 = Step5VideoGeneration(vp)
    return asyncio.run(step5.run(video_path, segments, output_dir))

@flow(name="video_processing_pipeline")
def video_processing_flow(video_path: str, output_dir: str):
    logger = get_run_logger()
    logger.info(f"Starting processing pipeline for {video_path}")
    
    # 1. Content Analysis
    analysis_result = analyze_content(video_path)
    logger.info(f"Analysis complete: {analysis_result}")
    
    # Placeholder Step 2: Timeline Extraction (Mocking it here as list)
    # In real flow, Step 2 would produce this list based on Step 1
    timeline_mock = [
        {"start": 10, "end": 20, "topic": "intro"},
        {"start": 30, "end": 45, "topic": "climax"}
    ]
    
    # 3. Scoring
    scored_segments = score_segments(timeline_mock)
    
    # 4. Filter High Quality (Mock filter)
    high_quality_segments = [s for s in scored_segments if s['score'] > 8]
    
    # 5. Generate Clips
    final_clips = generate_clips(video_path, high_quality_segments, output_dir)
    
    return final_clips

if __name__ == "__main__":
    # Local test
    # video_processing_flow("test.mp4", "./output")
    pass
