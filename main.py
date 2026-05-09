

import os
from dotenv import load_dotenv
from cleaner import clean_comments
from embedder import get_embeddings
from clusterer import cluster_comments
from googleapiclient.discovery import build

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")
VIDEO_ID = "K8AJqCCpL6w"

if not API_KEY:
    raise ValueError("API key not found. Check your .env file.")


API_KEY = os.getenv("YOUTUBE_API_KEY")
VIDEO_ID = "K8AJqCCpL6w"

def get_comments(video_id,max_comments=70):
    youtube=build("youtube","v3",developerKey=API_KEY)

    comments=[]
    request=youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100
    )
    while request and len(comments)<max_comments:
        response=request.execute()

        for item in response["items"]:
           snippet = item["snippet"]["topLevelComment"]["snippet"]
           comments.append({
           "text": snippet["textDisplay"],
           "likes": snippet["likeCount"],
            "author": snippet["authorDisplayName"],
})
           if len(comments)>=max_comments:
                break
        request=youtube.commentThreads().list_next(request,response)
    return comments



if __name__ == "__main__":
    comments = get_comments(VIDEO_ID, max_comments=50)
    cleaned = clean_comments(comments)
    embeddings = get_embeddings(cleaned)

    clusters = cluster_comments(embeddings, cleaned)

    print(f"\n--- {len(clusters)} topic clusters found ---\n")
    for i, cluster in enumerate(clusters, 1):
        print(f"Cluster {i} ({len(cluster)} comments):")
        for c in cluster[:3]:  # show top 3 per cluster
            print(f"  → {c['text'][:80]}")
        print()