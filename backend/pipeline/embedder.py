import os
import requests

def get_embeddings(cleaned_comments):
    texts = [c["text"] for c in cleaned_comments]
    
    # Use the industry-standard all-MiniLM-L6-v2 model (extremely fast and accurate)
    API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    
    # Retrieve HF Token from environment variables
    hf_token = os.getenv("HF_TOKEN")
    headers = {}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"
        
    payload = {
        "inputs": texts,
        "options": {"wait_for_model": True}
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise ValueError(f"Hugging Face API failed: {response.text}")
        
    embeddings = response.json()
    return embeddings
