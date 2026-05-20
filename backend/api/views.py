from rest_framework.decorators import api_view
from rest_framework.response import Response

from pipeline.main import get_comments
from pipeline.cleaner import clean_comments
from pipeline.embedder import get_embeddings
from pipeline.clusterer import cluster_comments, label_clusters


@api_view(['POST'])
def analyze(request):
    # step 1: get URL from request body
    url = request.data.get('url')

    if not url:
        return Response(
            {'error': 'URL is required'},
            status=400
        )

    try:
        # step 2: run your pipeline
        raw_comments = get_comments(url, max_comments=50)

        if len(raw_comments) < 10:
            return Response(
                {'error': 'Not enough comments to analyze'},
                status=400
            )

        cleaned = clean_comments(raw_comments)
        embeddings = get_embeddings(cleaned)
        clusters = cluster_comments(embeddings, cleaned)
        labelled = label_clusters(clusters, len(cleaned))

        # step 3: return JSON
        return Response({
            'video_title': raw_comments[0].get('video_title', 'Unknown'),
            'total_comments_fetched': len(raw_comments),
            'total_after_cleaning': len(cleaned),
            'clusters': labelled
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )