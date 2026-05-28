def cluster_comments(embeddings, cleaned_comments):
    import numpy as np
    import umap
    import hdbscan

    n_samples = len(cleaned_comments)

    if n_samples < 5:
        return [cleaned_comments]

    # dynamically adjust based on sample size
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

    min_cluster_size = min(5, max(2, n_samples // 3))
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
            clusters[label] = []
        clusters[label].append(cleaned_comments[i])

    sorted_clusters = sorted(clusters.values(), key=len, reverse=True)
    return sorted_clusters[:5]


def label_clusters(clusters, total_comments):
    labelled = []
    for i, cluster in enumerate(clusters, 1):
        avg_likes = sum(c["likes"] for c in cluster) / len(cluster)
        percentage = round(len(cluster) / total_comments * 100, 1)
        labelled.append({
            "cluster_id": i,
            "size": len(cluster),
            "percentage": percentage,
            "avg_likes": round(avg_likes, 1),
            "top_comments": [c["text"] for c in cluster[:3]],
        })
    return labelled

if __name__ == "__main__":
    print("Run from main.py")