import os
import requests

def get_embeddings(cleaned_comments):
    # Prioritize dedicated GEMINI_API_KEY, fallback to YOUTUBE_API_KEY
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("Neither GEMINI_API_KEY nor YOUTUBE_API_KEY environment variables are set.")

    texts = [c["text"] for c in cleaned_comments]
    
    # Google's Batch Embeddings endpoint using the state-of-the-art text-embedding-004 model
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key={api_key}"
    
    requests_payload = []
    for text in texts:
        requests_payload.append({
            "model": "models/text-embedding-004",
            "content": {
                "parts": [{"text": text}]
            }
        })
        
    payload = {
        "requests": requests_payload
    }
    
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, headers=headers, json=payload)
    
    # Fallback to older embedding model if text-embedding-004 isn't enabled on the key
    if response.status_code != 200:
        fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:batchEmbedContents?key={api_key}"
        for req in requests_payload:
            req["model"] = "models/embedding-001"
            
        response = requests.post(fallback_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            raise ValueError(f"Google Embedding API failed: {response.text}")
            
    data = response.json()
    
    # Extract vector values (768 dimensions)
    embeddings = [item["values"] for item in data["embeddings"]]
    return embeddings
