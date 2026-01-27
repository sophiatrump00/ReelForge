from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
import json

router = APIRouter()
KEYWORDS_FILE = "/app/data/config/keywords.json"

class KeywordConfig(BaseModel):
    positive: List[str]
    negative: List[str]
    categories: Dict[str, List[str]]

def load_keywords():
    if not os.path.exists(KEYWORDS_FILE):
        return {
            "positive": [],
            "negative": [],
            "categories": {
                "productType": [],
                "contentType": [],
                "emotion": []
            }
        }
    try:
        with open(KEYWORDS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {"positive": [], "negative": [], "categories": {}}

def save_keywords(data: dict):
    os.makedirs(os.path.dirname(KEYWORDS_FILE), exist_ok=True)
    with open(KEYWORDS_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@router.get("/", response_model=KeywordConfig)
def get_keywords():
    return load_keywords()

@router.post("/", response_model=KeywordConfig)
def update_keywords(config: KeywordConfig):
    save_keywords(config.dict())
    return config
