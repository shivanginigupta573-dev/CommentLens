from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(cleaned_comments):
    
    texts = [c["text"] for c in cleaned_comments]
    embeddings = model.encode(texts)
    return embeddings
