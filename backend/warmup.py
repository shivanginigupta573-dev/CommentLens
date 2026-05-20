import os
import sys
import numpy as np

# Set paths matching settings.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.environ["NUMBA_CACHE_DIR"] = os.path.join(BASE_DIR, "numba_cache")

print("--> Starting Pre-Deployment Warmup & Compilation Script...")

# Add pipeline to python path so we can import it
sys.path.append(BASE_DIR)

from pipeline.clusterer import cluster_comments

print("1/2. Skipping model download (using Hugging Face Serverless API)...")

print("2/2. Pre-compiling UMAP and HDBSCAN (JIT compilation)...")
# Generate dummy embeddings and text to compile Numba functions
dummy_embeddings = np.random.rand(15, 384)
dummy_comments = [{"text": f"dummy comment {i}", "likes": i, "author": "user"} for i in range(15)]

# Trigger the JIT compiler by executing the clustering pipeline once
clusters = cluster_comments(dummy_embeddings, dummy_comments)
print("   [Success] JIT compilation completed and cached successfully.")

print("--> Warmup finished! Backend is ultra-lightweight and ready.")
