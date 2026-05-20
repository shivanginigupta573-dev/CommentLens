#!/usr/bin/env bash
# Render build script for CommentLens backend
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files for Django admin
python manage.py collectstatic --noinput

# Run database migrations
python manage.py migrate --noinput
