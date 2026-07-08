# CommentLens 👁️

An AI-powered Audience Intelligence pipeline that transforms thousands of unstructured YouTube video comments into clean, actionable, clustered topic signals for content creators and marketing teams.

Unlike generic analytics tools that rely strictly on quantitative metrics like views or likes, **CommentLens** implements a custom, multi-stage Natural Language Processing (NLP) data engineering pipeline to surface core semantic themes and eliminate baseline comment noise.

---

## 🏗️ Core Architecture & Data Flow

The application is engineered with a high-performance Python backend leveraging Django REST Framework (DRF) and a highly responsive React frontend dashboard optimized with Vite.

### The 5-Stage Request & Processing Pipeline

1. **Ingestion Layer:** The client sends a target YouTube URL via Axios to the backend. The backend extracts the unique Video ID and calls the YouTube Data API v3, paginating through comment threads to aggregate text, author identities, and engagement counts.
2. **Spam Shield & Data Hygiene:** Raw comments pass through seven distinct sequence filters to remove syntax anomalies, non-English noise, and engagement traps.
3. **Dense Vector Embeddings:** Sanitized text outputs are mapped into a continuous vector space utilizing an asynchronous or lazy-loaded Transformer architecture.
4. **Dimensionality Reduction:** High-dimensional spaces (384D) are projected down into lower manifolds (5D) while preserving essential local neighborhood structures to prevent spatial distance decay.
5. **Density Clustering & Ranking:** Density-based geometric algorithms organically isolate semantic clusters without requiring an arbitrary cluster count input (K), separating valid topics from background architectural noise.

---

## 🧪 Deep Dive: Data Engineering & Machine Learning

### 1. Data Hygiene Operations (`cleaner.py`)

To prevent data contamination ("garbage-in, garbage-clusters"), every comment passes through an isolated cleaning matrix:

- **HTML Entity Decoding:** Converts characters like `&#39;` and `&amp;` back to literal string characters (`'` and `&`).
- **Structural Tag Elimination:** Drops elements like `<br>` and `<b>` using strict regular expression patterns.
- **Hyperlink Removal:** Identifies and strips full URLs to eliminate artificial grouping patterns.
- **Emoji Stripping:** Drops dense emoji layouts that skew spatial embeddings away from purely text-based definitions.
- **Length & Frequency Culling:** Filters out low-signal comments containing fewer than 5 tokens (e.g., "nice video", "first").
- **Language Distribution Check:** Enforces an ASCII density ratio constraint (ASCII Characters / Total Characters ≥ 0.5) to safely filter out scripts like Cyrillic, Arabic, or Devanagari, ensuring model language alignment.

### 2. Sentence Embeddings (`embedder.py`)

- **Architecture:** `all-MiniLM-L6-v2` (Sentence-Transformers library).
- **Vector Matrix:** Maps each comment into a 384-dimensional dense vector space representation.
- **Metric Choice:** Uses Cosine Similarity rather than traditional Euclidean calculations to evaluate directional alignment and capture identical sentiment independent of structural length variations.
- **Optimization Strategy:** Implements lazy model loading deferred to the runtime request phase, keeping initial backend start-up memory usage low.

### 3. Topological Structural Reduction (UMAP)

To resolve the **Curse of Dimensionality** (where high-dimensional points become uniformly equidistant), UMAP reduces data from 384D down to 5D:

- `n_components = 5`: Retains critical topological neighborhoods without over-compressing down to standard visual 2D space.
- `n_neighbors = min(15, n_samples - 1)`: Dynamically shifts bounds to prevent runtime crashes when dealing with small, heavily filtered message sets.
- `min_dist = 0.0`: Maximizes local point packing constraints inside the low-dimensional space to highlight explicit density transitions for downstream clustering.
- `metric = 'cosine'`: Enforces mathematical consistency with the initial embedding model space boundaries.

### 4. Mathematical Density Clustering (HDBSCAN)

Rather than relying on K-Means (which assumes uniform spherical shapes and forces arbitrary placement of structural noise), CommentLens leverages Hierarchical Density-Based Spatial Clustering of Applications with Noise (HDBSCAN):

- **Dynamic Determination:** Evaluates dense spatial regions to auto-discover the natural number of topic groups.
- **Noise Segregation:** Identifies loose, un-correlated text signals and isolates them into a dedicated outlier category labeled `-1`.
- **`min_cluster_size = min(5, n_samples // 3)`:** Adapts clustering parameters programmatically according to overall video comment volume.
- **Representative Synthesis:** Finds key representative highlights by computing the arithmetic centroid of the cluster embeddings, then isolating the top three comments with the minimal cosine distance to that centroid.

---

## 🛠️ Technical Implementation Stack

- **Frontend Interface:** React 18+, Vite Build Toolchain, CSS3 Architecture System.
- **API Service Layer:** Axios HTTP Client, Django Rest Framework (DRF).
- **Core NLP Analytics Ecosystem:** Python 3.10+, Sentence-Transformers, UMAP-learn, HDBSCAN, NumPy, Regex Processing Libraries.

---

## 🚀 Installation & Local Environment Setup

### 1. High-Performance Analytics Backend

```bash
cd backend
python -m venv venv

# Activate Environment (Windows)
.\venv\Scripts\activate
# Activate Environment (Mac/Linux)
source venv/bin/activate

pip install -r requirements.txt
python manage.py runserver
```
