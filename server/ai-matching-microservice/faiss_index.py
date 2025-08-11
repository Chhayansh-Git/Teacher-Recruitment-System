# server/ai-matching-microservice/faiss_index.py

import json
import faiss
import numpy as np
import os

def get_candidate_texts(candidates_json_path):
    """Returns a mapping: idx -> (candidate_id, profile_text)"""
    items = []
    with open(candidates_json_path, "r", encoding="utf-8") as f:
        for obj in json.load(f):
            items.append((obj["id"], obj["profile_text"]))
    return items

def load_faiss_index(index_path, embeddings_path, candidates_json_path):
    id_texts = get_candidate_texts(candidates_json_path)
    candidate_ids = [cid for cid, _ in id_texts]
    cand_texts = [txt for _, txt in id_texts]

    embeddings = np.load(embeddings_path)
    faiss_index = faiss.read_index(index_path)

    assert faiss_index.ntotal == len(candidate_ids), "Index/Candidates out of sync"
    return faiss_index, candidate_ids, cand_texts

def knn_search(query_vec, faiss_index, candidate_ids, cand_texts, top_k, filter_ids=None):
    xq = np.array(query_vec, dtype="float32")[None, :]
    D, I = faiss_index.search(xq, faiss_index.ntotal)  # search all, then filter
    # Scores: larger = more similar (cosine)

    filtered = [
        (candidate_ids[i], float(D[0][j]))
        for j, i in enumerate(I[0])
        if (not filter_ids or candidate_ids[i] in filter_ids)
    ]
    # Take top_k
    return [cid for cid, _ in filtered[:top_k]], [score for _, score in filtered[:top_k]]

def build_or_update_index(embeddings, out_index_path):
    embeddings = np.asarray(embeddings).astype('float32')
    if embeddings.ndim != 2:
        raise ValueError("Embeddings shape is not 2D")
    faiss.normalize_L2(embeddings)
    dim = embeddings.shape[1]
    print(f"Shape: {embeddings.shape}, dtype: {embeddings.dtype}, dim: {dim}")
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings) # type: ignore
    faiss.write_index(index, out_index_path)
    return index
