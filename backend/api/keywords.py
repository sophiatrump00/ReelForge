from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.models.settings import Keyword

router = APIRouter()

class KeywordConfig(BaseModel):
    positive: List[str]
    negative: List[str]
    categories: Dict[str, List[str]] = {}

@router.get("/", response_model=KeywordConfig)
def get_keywords(db: Session = Depends(get_db)):
    keywords = db.query(Keyword).all()
    
    result = {
        "positive": [],
        "negative": [],
        "categories": {
            "productType": [],
            "contentType": [],
            "emotion": []
        }
    }
    
    for k in keywords:
        if k.category == "positive":
            result["positive"].append(k.text)
        elif k.category == "negative":
            result["negative"].append(k.text)
        else:
            # Custom category
            if k.category not in result["categories"]:
                result["categories"][k.category] = []
            result["categories"][k.category].append(k.text)
    
    return result

@router.post("/", response_model=KeywordConfig)
def update_keywords(config: KeywordConfig, db: Session = Depends(get_db)):
    try:
        # Full replacement
        db.query(Keyword).delete()
        
        # Add Positive
        for text in set(config.positive): # Use set to avoid duplicates
            if text:
                db.add(Keyword(text=text, category="positive"))
            
        # Add Negative
        for text in set(config.negative):
            if text:
                db.add(Keyword(text=text, category="negative"))
            
        # Add Categories
        for cat_name, texts in config.categories.items():
            for text in set(texts):
                if text:
                    db.add(Keyword(text=text, category=cat_name))
        
        db.commit()
        return config
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
