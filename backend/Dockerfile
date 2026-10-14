
FROM node:22-bookworm-slim

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


# Generate Prisma Client using the existing root Prisma configuration.
# Install dotenv where the root configuration can resolve it.
RUN npm install --prefix /app/backend --no-save --package-lock=false dotenv

RUN DATABASE_URL="postgresql://build_only:build_only@localhost:5432/build_only" \
    NODE_PATH=/app/backend/node_modules \
    npx prisma generate --config /app/prisma.config.ts

EXPOSE 4000

# Start NestJS with development hot reload.
CMD ["npm", "run", "start:dev"]
