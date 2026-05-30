import os
import numpy as np
import requests

def get_embeddings(cleaned_comments):
    texts = [c["text"] for c in cleaned_comments]
    
    response = requests.post(
        "https://api.openai.com/v1/embeddings",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY', '')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "text-embedding-3-small",
            "input": texts
        }
    )
    
    if response.status_code != 200:
        raise Exception(f"OpenAI API error: {response.text}")
    
    data = response.json()
    embeddings = np.array([item["embedding"] for item in data["data"]])
    return embeddings