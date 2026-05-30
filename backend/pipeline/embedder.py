import os
import numpy as np
from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(
            'sentence-transformers/all-MiniLM-L6-v2',
            backend='onnx'
        )
    return _model

def get_embeddings(cleaned_comments):
    texts = [c["text"] for c in cleaned_comments]
    embeddings = get_model().encode(texts)
    return embeddings