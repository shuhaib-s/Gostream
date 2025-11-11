FROM tiangolo/nginx-rtmp:latest

# Install gettext for envsubst (environment variable substitution)
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Expose ports
EXPOSE 1935 8080

# Start script that substitutes environment variables
CMD envsubst '$$BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

