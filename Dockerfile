FROM node:18-alpine

# Add dependencies for Prisma and health check
RUN apk add --no-cache \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy rest of the application (excluding .env due to .dockerignore)
COPY . .

# Create a default .env file for Prisma (will be overridden by actual env vars)
RUN echo "DATABASE_URL=postgresql://placeholder" > .env

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Start production server
CMD ["npm", "run", "node:prod"]