#!/bin/sh
echo "Compiling Frontend..."
cd /app/frontend
# Defaults values for Frontend App screens
export VUE_APP_HANA_SYSTEMNODE=$HANA_SYSTEMNODE
export VUE_APP_HANA_TENANTNODE=$HANA_TENANTNODE
export VUE_APP_HANA_SERVERNODE=$HANA_SERVERNODE
export VUE_APP_HANA_TENANTDBNAME=$HANA_TENANTDBNAME
export VUE_APP_HANA_AUTHUSER=$HANA_AUTHUSER
export VUE_APP_HANA_HDIADMINUSER=$HANA_HDIADMINUSER
npm run build

echo "Starting Nginx..."
mkdir -p /run/nginx
rm /etc/nginx/sites-enabled/default
nginx

echo "Running Admin Module..."
cd /app/admin
npm run start &

echo "Starting backend..."
cd /app/backend
npm run prod