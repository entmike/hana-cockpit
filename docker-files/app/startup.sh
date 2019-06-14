#!/bin/sh
echo "Starting Nginx..."
mkdir -p /run/nginx
rm /etc/nginx/sites-enabled/default
nginx

echo "Starting services..."
cd /app
node run