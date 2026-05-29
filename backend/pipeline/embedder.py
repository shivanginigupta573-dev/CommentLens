import os
import numpy as np
from google import genai
from google.genai import types

def get_embeddings(cleaned_comments):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
    texts = [c["text"] for c in cleaned_comments]

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
        config=types.EmbedContentConfig(task_type="CLUSTERING")
    )

    embeddings = np.array([e.values for e in result.embeddings])
    return embeddings