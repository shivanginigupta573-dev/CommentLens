import re
import html

def clean_comments(comments):
    cleaned = []
    
    # Robust anti-spam arrays
    spam_pattern = re.compile(r'(pls|please|plz)\s+(like|subscribe|sub|share)', re.IGNORECASE)
    roll_call_pattern = re.compile(r'(who is|anyone|watching|from|still listening|still enjoying).*(2024|2025|2026|january|july|august)', re.IGNORECASE)
    
    html_tag_pattern = re.compile(r"<[^>]+>")
    url_pattern = re.compile(r"https?://\S+")
    text_cleaning_pattern = re.compile(r"[^\w\s]") 
    spaces_pattern = re.compile(r"\s+")

    for c in comments:
        original_text = c["text"].strip()

        if spam_pattern.search(original_text) or roll_call_pattern.search(original_text):
            continue

        # --- IMPROVEMENT #2: Sanitize Display Text to Prevent URL Leaking ---
        display_text = html.unescape(original_text)
        display_text = html_tag_pattern.sub(" ", display_text)
        display_text = url_pattern.sub("", display_text)  # Erase raw link structures
        display_text = spaces_pattern.sub(" ", display_text).strip()

        # Skip comment if stripping a URL leaves it empty
        if not display_text:
            continue

        # Prepare text for embedding vectors
        ai_text = display_text.lower()
        ai_text = text_cleaning_pattern.sub("", ai_text)
        ai_text = spaces_pattern.sub(" ", ai_text).strip()

        if len(ai_text.split()) < 4:
            continue

        ascii_ratio = sum(1 for ch in ai_text if ord(ch) < 128) / max(len(ai_text), 1)
        if ascii_ratio < 0.65:
            continue

        cleaned.append({
            "text": display_text,       # URL-free sanitized presentation text
            "search_text": ai_text,      
            "likes": c["likes"],
            "author": c["author"],
        })

    return cleaned