# Docker Image containing SAP HANA npm package
FROM node:8-slim

LABEL Maintainer="Mike Howles <mike.howles@gmail.com>"
ENV CONFIG=/config
ENV VUE_APP_HANA_APP_BACKEND=/backend

# Install nginx to handle backend and frontend apps
RUN apt-get update && apt-get install -y nginx

# Configure nginx and startup
COPY ./server.conf /etc/nginx/conf.d/default.conf

# Copy backend Node JS module
COPY /backend /app/backend

# Copy production build of Vue frontend app
COPY /frontend /app/frontend

# Force rebuild of @sap/hana-client since there are binary bindings
RUN rm -Rf /app/backend/node_modules/@sap && \
    cd /app/backend && npm i

# Copy startup.sh script
COPY ./startup.sh /app/startup.sh

WORKDIR /app
CMD ./startup.sh