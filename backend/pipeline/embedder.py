from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_embeddings(cleaned_comments):
    # CRITICAL: Extract the pure semantic text fingerprint, not the raw text block
    texts = [c["search_text"] for c in cleaned_comments]
    return get_model().encode(texts)