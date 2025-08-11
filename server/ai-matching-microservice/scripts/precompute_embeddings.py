# server/ai-matching-microservice/scripts/precompute_embeddings.py

import numpy as np
import json
from model_inference import load_model, embed_text

import sys

MODEL_PATH = "thenlper/gte-base"

def main(input_json, output_embeddings, output_index):
    model, _ = load_model(MODEL_PATH)
    with open(input_json, "r", encoding="utf-8") as f:
        candidates = json.load(f)

    embeddings = []
    for obj in candidates:
        vector = embed_text(obj["profile_text"], model)
        embeddings.append(vector)

    embeddings = np.stack(embeddings)
    np.save(output_embeddings, embeddings)

    from faiss_index import build_or_update_index
    build_or_update_index(embeddings, output_index)

if __name__ == "__main__":
    # Usage: python scripts/precompute_embeddings.py data/candidates.json data/candidate_embeddings.npy data/faiss.index
    if len(sys.argv) != 4:
        print("Usage: ... candidates.json candidate_embeddings.npy faiss.index")
        sys.exit(1)
    main(*sys.argv[1:])
