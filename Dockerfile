FROM node:20-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="react-router"
LABEL "description"="LLM Inference Visualization with WebLLM"

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.6.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN pnpm build

# Production stage
FROM zeabur/caddy-static:latest

# Set working directory to Caddy's root
WORKDIR /usr/share/caddy

# Copy the CONTENTS of the client directory to the current directory
# This avoids ambiguity with trailing slashes
COPY --from=build /app/dist/client/ .

# Create Caddyfile for proper SPA routing
RUN cat > /etc/caddy/Caddyfile <<'EOF'
:8080 {
    root * /usr/share/caddy
    encode gzip

    # Handle SPA routing
    # If the file exists, serve it.
    # If not, serve index.html (client-side routing)
    try_files {path} /index.html

    # Security headers
    header {
        # Enable HTTPS redirects
        Strict-Transport-Security "max-age=31536000;"
        # Prevent XSS
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        # Enable WebAssembly (required for WebLLM)
        Cross-Origin-Embedder-Policy "require-corp"
        Cross-Origin-Opener-Policy "same-origin"
    }

    # Default file server
    file_server
}
EOF

EXPOSE 8080
