import re
import html

def clean_comments(comments):
    cleaned = []

    for c in comments:
        text = c["text"].strip()

        # Decode HTML entities
        text = html.unescape(text)

        # Remove HTML tags
        text = re.sub(r"<[^>]+>", " ", text)

        # Remove URLs
        text = re.sub(r"https?://\S+", "", text)

        # Remove special characters & emojis
        text = re.sub(r"[^\w\s]", "", text)

        # Normalize spaces
        text = re.sub(r"\s+", " ", text).strip()

        # Filter short comments
        if len(text.split()) < 3:
            continue

        # Filter non-English heavy text
        ascii_ratio = sum(1 for ch in text if ord(ch) < 128) / max(len(text), 1)
        if ascii_ratio < 0.5:
            continue

        cleaned.append({
            "text": text.lower(),
            "likes": c["likes"],
            "author": c["author"],
        })

    return cleaned
