FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

WORKDIR /app

COPY ./nginx-selfsigned.crt /app/nginx-selfsigned.crt
COPY ./nginx-selfsigned.key /app/nginx-selfsigned.key

RUN chown -R nginx:nginx /app && chmod -R 755 /app && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

# Start Nginx as the non-root user
USER nginx

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
