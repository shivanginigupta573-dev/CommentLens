import os
from dotenv import load_dotenv
from googleapiclient.discovery import build

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")

if not API_KEY:
    import warnings
    warnings.warn("YOUTUBE_API_KEY not found. YouTube features will not work.")


def get_comments(video_id_or_url, max_comments=100):
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY not set. Check your environment variables.")

    youtube = build("youtube", "v3", developerKey=api_key)

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
