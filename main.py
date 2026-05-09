

import os
from dotenv import load_dotenv
from cleaner import clean_comments
from embedder import get_embeddings
from clusterer import cluster_comments, label_clusters
from googleapiclient.discovery import build

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")
VIDEO_ID = "K8AJqCCpL6w"

if not API_KEY:
    raise ValueError("API key not found. Check your .env file.")


API_KEY = os.getenv("YOUTUBE_API_KEY")
VIDEO_ID = "K8AJqCCpL6w"

def get_comments(video_id_or_url, max_comments=100):
    youtube = build("youtube", "v3", developerKey=API_KEY)

    # extract video ID if full URL passed
    if "youtube.com" in video_id_or_url or "youtu.be" in video_id_or_url:
        import re
        match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", video_id_or_url)
        video_id = match.group(1) if match else video_id_or_url
    else:
        video_id = video_id_or_url

    # get video title
    video_response = youtube.videos().list(
        part="snippet",
        id=video_id
    ).execute()
    title = video_response['items'][0]['snippet']['title'] if video_response['items'] else 'Unknown'
    channel = video_response['items'][0]['snippet']['channelTitle'] if video_response['items'] else 'Unknown'

    comments = []
    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100,
        textFormat="plainText"
    )

    while request and len(comments) < max_comments:
        response = request.execute()
        for item in response["items"]:
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            comments.append({
                "text": snippet["textDisplay"],
                "likes": snippet["likeCount"],
                "author": snippet["authorDisplayName"],
                "video_title": title,
                "channel": channel,
            })
            if len(comments) >= max_comments:
                break
        request = youtube.commentThreads().list_next(request, response)

    return comments



if __name__ == "__main__":
    comments = get_comments(VIDEO_ID, max_comments=50)
    cleaned = clean_comments(comments)
    embeddings = get_embeddings(cleaned)
    clusters = cluster_comments(embeddings, cleaned)
    labelled = label_clusters(clusters, len(cleaned))

    print(f"\n--- {len(labelled)} clusters found ---\n")
    for c in labelled:
        print(f"Cluster {c['cluster_id']} — {c['percentage']}% of comments | avg {c['avg_likes']} likes")
        for comment in c['top_comments']:
            print(f"  → {comment[:80]}")
        print()