import numpy as np
import umap
import hdbscan

def cluster_comments(embeddings,cleaned_comments):
    reducer=umap.UMAP(n_components=5,random_state=42,min_dist=0.0,metric="cosine")
    reduced=reducer.fit_transform(embeddings)

    clusterer=hdbscan.HDBSCAN(min_cluster_size=5,min_samples=3)
    labels=clusterer.fit_predict(reduced)

    clusters={}
    for i,label in enumerate(labels):
        if label==-1:
            continue
        if label not in clusters:
            clusters[label]=[]
        clusters[label].append(cleaned_comments[i])

    sorted_clusters=sorted(clusters.values(),key=len,reverse=True)
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

if __name__=="__main__":
    print("Run from main.py")
