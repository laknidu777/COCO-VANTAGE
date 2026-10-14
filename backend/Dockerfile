
FROM node:22-bookworm-slim

WORKDIR /app

# Install backend dependencies from the existing lockfile.
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci

# Copy the existing Prisma schema, configuration, and migrations.
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Copy backend source and configuration.
COPY backend ./backend

WORKDIR /app/backend

# Generate Prisma Client without connecting to a real database.
RUN DATABASE_URL="postgresql://build_only:build_only@localhost:5432/build_only" \
    npx prisma generate --config ../prisma.config.ts

EXPOSE 4000

# Start NestJS in development mode with hot reload.
CMD ["npm", "run", "start:dev"]
