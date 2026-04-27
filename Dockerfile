# Stage 1: Build Angular
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

WORKDIR /usr/share/caddy

# Copy built Angular app from browser folder
COPY --from=builder /app/dist/cvplus-landing/browser .

COPY Caddyfile /etc/caddy/Caddyfile
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]