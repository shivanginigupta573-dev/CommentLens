import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from googleapiclient.errors import HttpError

from pipeline.main import get_comments
from pipeline.cleaner import clean_comments
from pipeline.embedder import get_embeddings
from pipeline.clusterer import cluster_comments, label_clusters


@api_view(['POST'])
def analyze(request):
    url = request.data.get('url')

    if not url:
        return Response({'error': 'URL is required'}, status=400)

    try:
        raw_comments = get_comments(url, max_comments=50)

        if len(raw_comments) < 10:
            return Response({'error': 'Not enough comments to analyze'}, status=400)

        cleaned = clean_comments(raw_comments)
        
        if len(cleaned) < 5:
            return Response({'error': 'Not enough meaningful comments after cleaning'}, status=400)

        embeddings = get_embeddings(cleaned)
        clusters = cluster_comments(embeddings, cleaned)
        labelled = label_clusters(clusters, len(cleaned))

        return Response({
            'video_title': raw_comments[0].get('video_title', 'Unknown'),
            'total_comments_fetched': len(raw_comments),
            'total_after_cleaning': len(cleaned),
            'clusters': labelled
        })

    except HttpError as e:
        try:
            content = json.loads(e.content)
            reason = content['error']['errors'][0]['reason']
            if reason == 'commentsDisabled':
                return Response({'error': 'Comments are disabled on this video.'}, status=400)
            elif reason == 'quotaExceeded':
                return Response({'error': 'YouTube quota exceeded. Try again tomorrow.'}, status=503)
        except:
            pass
        return Response({'error': 'YouTube API error.'}, status=500)

    except Exception as e:
        return Response({'error': str(e)}, status=500)