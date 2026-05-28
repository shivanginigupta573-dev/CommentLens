import requests
import numpy as np
import os

HF_TOKEN = os.getenv("HF_TOKEN", "")
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"

def get_embeddings(cleaned_comments):
    texts = [c["text"] for c in cleaned_comments]
    
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": texts, "options": {"wait_for_model": True}}
    )
    
    if response.status_code != 200:
        raise Exception(f"HF API error: {response.text}")
    
    embeddings = np.array(response.json())
    return embeddings