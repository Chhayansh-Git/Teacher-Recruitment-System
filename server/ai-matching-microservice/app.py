# server/ai-matching-microservice/app.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import numpy as np
import faiss
from model_inference import embed_text, load_model
from faiss_index import (
    load_faiss_index, get_candidate_texts, knn_search, build_or_update_index
)
import os

MODEL_PATH = os.environ.get("MODEL_PATH", "thenlper/gte-base")
FAISS_INDEX_PATH = "data/faiss.index"
CANDIDATES_JSON_PATH = "data/candidates.json"
EMBEDDINGS_PATH = "data/candidate_embeddings.npy"

app = FastAPI(title="Hybrid Semantic Matching Microservice")

# Prefetch on startup
model, tokenizer = load_model(MODEL_PATH)
faiss_index, candidate_ids, cand_texts = load_faiss_index(
    FAISS_INDEX_PATH, EMBEDDINGS_PATH, CANDIDATES_JSON_PATH
)

class EmbedRequest(BaseModel):
    text: str

class KNNRequest(BaseModel):
    requirement_text: str
    top_k: int = 10
    filter_ids: Optional[List[str]] = None  # Only match against subset if provided

class KNNResult(BaseModel):
    candidate_id: str
    score: float

@app.on_event("startup")
def reload_on_startup():
    # Global for thread/process
    global model, tokenizer, faiss_index, candidate_ids, cand_texts
    model, tokenizer = load_model(MODEL_PATH)
    faiss_index, candidate_ids, cand_texts = load_faiss_index(
        FAISS_INDEX_PATH, EMBEDDINGS_PATH, CANDIDATES_JSON_PATH
    )

@app.post("/embed")
def embed(req: EmbedRequest):
    try:
        vector = embed_text(req.text, model, tokenizer)
        return {"embedding": vector.tolist()}
    except Exception as e:
        raise HTTPException(500, f"Embedding error: {e}")

@app.post("/knn-search", response_model=List[KNNResult])
def knn_api(req: KNNRequest):
    try:
        vector = embed_text(req.requirement_text, model, tokenizer)
        candidates, scores = knn_search(
            vector, faiss_index, candidate_ids, cand_texts, req.top_k, req.filter_ids
        )
        return [
            KNNResult(candidate_id=cid, score=float(score))
            for cid, score in zip(candidates, scores)
        ]
    except Exception as e:
        raise HTTPException(500, f"KNN search error: {e}")

@app.post("/reload-index")
def reload_index():
    global faiss_index, candidate_ids, cand_texts
    try:
        faiss_index, candidate_ids, cand_texts = load_faiss_index(
            FAISS_INDEX_PATH, EMBEDDINGS_PATH, CANDIDATES_JSON_PATH
        )
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(500, f"Reload error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5005)
