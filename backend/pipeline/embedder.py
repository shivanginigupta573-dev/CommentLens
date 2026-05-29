from sklearn.feature_extraction.text import TfidfVectorizer


def get_embeddings(cleaned_comments):
    """
    Generate TF-IDF vector embeddings from cleaned comment texts.
    
    This runs 100% locally with zero external API calls.
    No Hugging Face, no Google Gemini, no network dependencies.
    scikit-learn's TF-IDF is lightweight, fast, and perfectly
    suited for topic clustering of YouTube comments.
    """
    texts = [c["text"] for c in cleaned_comments]

    vectorizer = TfidfVectorizer(
        max_features=512,       # Cap dimensions for UMAP compatibility
        stop_words="english",   # Remove common words like "the", "is", etc.
        ngram_range=(1, 2),     # Capture single words AND two-word phrases
        min_df=2,               # Ignore extremely rare terms
        max_df=0.95,            # Ignore terms that appear in 95%+ of comments
    )

    embeddings = vectorizer.fit_transform(texts).toarray()
    return embeddings