model = None

def get_model():
    global model
    if model is None:
        # Lazy import: only load torch/sentence_transformers when actually needed
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('paraphrase-MiniLM-L3-v2')
    return model

def get_embeddings(cleaned_comments):
    texts = [c["text"] for c in cleaned_comments]
    embeddings = get_model().encode(texts)
    return embeddings
