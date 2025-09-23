# ---------- Build Stage ----------
FROM node:20-alpine AS builder

# Set working dir
WORKDIR /app

# Copy only package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app (output goes to /app/build)
RUN npm run build

# ---------- NGINX Stage ----------
FROM nginx:stable-alpine

# Copy custom nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



# To build:
# export DOCKER_CLI_EXPERIMENTAL=enabled
# docker buildx create --use --name multi-builder
# docker buildx inspect --bootstrap

# docker buildx build --platform linux/amd64,linux/arm64 -t registry.ivanbattimiello.xyz/react-sample:latest --push .

# verify
# docker buildx imagetools inspect registry.ivanbattimiello.xyz/react-sample:latest