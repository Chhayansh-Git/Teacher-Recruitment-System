# server/ai-matching-microservice/model_inference.py
import numpy as np
from sentence_transformers import SentenceTransformer

def load_model(model_name):
    model = SentenceTransformer(model_name)
    return model, None  # no special tokenizer for SBERT

def embed_text(text, model, tokenizer=None):
    # Handles either SBERT or other encoders
    text = text or ""
    if tokenizer:  # (For transformers requiring tokenizer)
        inputs = tokenizer(text, return_tensors="pt", truncation=True)
        outputs = model(**inputs)
        vector = outputs.pooler_output.detach().cpu().numpy()[0]
    else:
        vector = model.encode([text])[0]
    return vector / (np.linalg.norm(vector) + 1e-10)  # L2 normalise
