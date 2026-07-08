import numpy as np
import re
import math

def cluster_comments(embeddings, cleaned_comments):
    import umap
    import hdbscan

    n_samples = len(cleaned_comments)
    if n_samples < 5:
        return []

    n_neighbors = min(15, n_samples - 1)
    n_components = min(5, n_samples - 2)

    if n_components < 2:
        reduced = embeddings
    else:
        reducer = umap.UMAP(
            n_neighbors=n_neighbors,
            n_components=n_components,
            random_state=42,
            min_dist=0.0,
            metric="cosine"
        )
        reduced = reducer.fit_transform(embeddings)

    min_cluster_size = min(5, max(2, n_samples // 4))
    min_samples = min(3, max(1, min_cluster_size - 1))

    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples
    )
    labels = clusterer.fit_predict(reduced)

    clusters = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue
        if label not in clusters:
            clusters[label] = {"comments": [], "embeddings": []}
        
        clusters[label]["comments"].append(cleaned_comments[i])
        clusters[label]["embeddings"].append(embeddings[i])

    return list(clusters.values())


def label_clusters(clusters, total_comments):
    labelled = []
    
    # Stopwords to filter out when picking unique cluster topics
    STOPWORDS = {
        'the', 'and', 'this', 'that', 'with', 'your', 'from', 'they', 'have', 'this', 'that',
        'video', 'song', 'channel', 'youtube', 'comment', 'comments', 'like', 'just', 'about',
        'would', 'could', 'should', 'here', 'there', 'when', 'where', 'who', 'whom', 'which',
        'always', 'never', 'really', 'much', 'more', 'some', 'them', 'their', 'dont', 'cant',
        'will', 'your', 'what', 'every', 'everyone', 'people', 'guys', 'love', 'amazing', 'best',
        'taylor', 'swift', 'blank', 'space'
    }
    
    for i, cluster_data in enumerate(clusters, 1):
        cluster_comments = cluster_data["comments"]
        cluster_embeds = np.array(cluster_data["embeddings"])
        
        centroid = np.mean(cluster_embeds, axis=0)
        
        dot_products = np.dot(cluster_embeds, centroid)
        norms = np.linalg.norm(cluster_embeds, axis=1) * np.linalg.norm(centroid)
        norms = np.where(norms == 0, 1e-9, norms) 
        similarities = dot_products / norms
        
        closest_indices = np.argsort(similarities)[::-1]
        representative_comments = [cluster_comments[idx]["text"] for idx in closest_indices[:3]]
        
        # --- IMPROVEMENT #3: Word-Frequency Topic Labeler ---
        word_freq = {}
        for comp in cluster_comments:
            words = re.findall(r'\b[a-z]{4,15}\b', comp["text"].lower())
            for w in words:
                if w not in STOPWORDS:
                    word_freq[w] = word_freq.get(w, 0) + 1
                    
        if word_freq:
            top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:2]
            title_headline = f"Topic: {', '.join([w[0].capitalize() for w in top_keywords])}"
        else:
            best_comment = representative_comments[0]
            words = best_comment.split()
            title_headline = " ".join(words[:5]) + "..." if len(words) > 5 else best_comment

        avg_likes = sum(c["likes"] for c in cluster_comments) / len(cluster_comments)
        percentage = round(len(cluster_comments) / total_comments * 100, 1)
        
        labelled.append({
            "cluster_id": i,
            "title": title_headline,
            "size": len(cluster_comments),
            "percentage": percentage,
            "avg_likes": round(avg_likes, 1),
            "top_comments": representative_comments,
        })
        
    # --- IMPROVEMENT #5: Smart Impact Score Metric Sorting ---
    for item in labelled:
        # Impact Score = Cluster Size * (1.0 + ln(Avg Likes + 1))
        item["impact_score"] = item["size"] * (1.0 + math.log(item["avg_likes"] + 1))
        
    # Sort from highest impact score to lowest
    labelled = sorted(labelled, key=lambda x: x["impact_score"], reverse=True)
    
    # Re-normalize sequential IDs (1, 2, 3...) based on high-impact ranking order
    for idx, item in enumerate(labelled, 1):
        item["cluster_id"] = idx
        
    return labelled