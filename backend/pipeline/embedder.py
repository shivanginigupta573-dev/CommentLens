import os
import numpy as np
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_embeddings(cleaned_comments):
    genai.configure(api_key=GEMINI_API_KEY)
    texts = [c["text"] for c in cleaned_comments]
    
    embeddings = []
    for text in texts:
        result = genai.embed_content(
            model="models/text-embedding-001",
            content=text,
            task_type="clustering"
        )
        embeddings.append(result['embedding'])
    
    return np.array(embeddings)