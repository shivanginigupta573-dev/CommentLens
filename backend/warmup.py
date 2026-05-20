import os
import sys
import numpy as np

# Set paths matching settings.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.environ["HF_HOME"] = os.path.join(BASE_DIR, "ml_cache")
os.environ["NUMBA_CACHE_DIR"] = os.path.join(BASE_DIR, "numba_cache")

print("--> Starting Pre-Deployment Warmup & Compilation Script...")

# Add pipeline to python path so we can import it
sys.path.append(BASE_DIR)

from pipeline.embedder import get_model
from pipeline.clusterer import cluster_comments

print("1/3. Pre-downloading HuggingFace SentenceTransformer Model...")
# This forces download and caches the model locally
model = get_model()
print("   [Success] Model loaded and cached successfully.")

print("2/3. Pre-compiling UMAP and HDBSCAN (JIT compilation)...")
# Generate dummy embeddings and text to compile Numba functions
dummy_embeddings = np.random.rand(15, 384)
dummy_comments = [{"text": f"dummy comment {i}", "likes": i, "author": "user"} for i in range(15)]

# Trigger the JIT compiler by executing the clustering pipeline once
clusters = cluster_comments(dummy_embeddings, dummy_comments)
print("   [Success] JIT compilation completed and cached successfully.")

print("--> Warmup finished! All assets are fully cached and ready for instant startup.")
