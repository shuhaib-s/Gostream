FROM tiangolo/nginx-rtmp:latest

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 1935 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

