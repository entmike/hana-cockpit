# Docker Image containing SAP HANA npm package
FROM node:8-slim

# Configure @sap for SAP HANA Client NPM package from SAP's npm repository
RUN npm config set @sap:registry https://npm.sap.com

# Install Vue CLI
RUN npm i -g @vue/cli

LABEL Maintainer="Mike Howles <mike.howles@gmail.com>"
ENV CONFIG=/app/config
ENV VUE_APP_HANA_APP_BACKEND=/backend
ENV BACKEND_PORT=9999

# Install nginx to handle backend and frontend apps
RUN apt-get update && apt-get install -y nginx

# Configure nginx and startup
COPY ./docker-files/server.conf /etc/nginx/conf.d/default.conf
COPY ./docker-files/timeout.conf /etc/nginx/conf.d/timeout.conf

# Copy files
COPY ./frontend /app/frontend
COPY ./backend /app/backend
COPY ./docker-files/app /app
RUN chmod +x /app/startup.sh

# Force rebuild of @sap/hana-client since there are binary bindings
RUN rm -Rf /app/backend/node_modules/@sap

# Install Backend, Frontend, and Launcher
RUN cd /app/backend && npm i && \
    cd /app/frontend && npm i && npm run build && \
    cd /app && npm i

# Run Startup Script
WORKDIR /app
CMD ./startup.sh