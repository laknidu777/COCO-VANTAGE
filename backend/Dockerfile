
FROM node:22-bookworm-slim

# Install OpenSSL for Prisma engine binary compatibility in Debian Bookworm slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies using the existing lockfile.
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci

# Preserve the existing Prisma schema, configuration, and migrations.
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Copy the backend application.
COPY backend ./backend

WORKDIR /app/backend


# Link backend node_modules to /app so Prisma and root config resolve packages cleanly
RUN ln -s /app/backend/node_modules /app/node_modules

# Generate Prisma Client
RUN npx prisma generate --schema=../prisma/schema.prisma

EXPOSE 4000

# Start NestJS with development hot reload.
CMD ["npm", "run", "start:dev"]
