
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


# Install dotenv for the root Prisma configuration.
RUN npm install --no-save --package-lock=false dotenv

# Generate Prisma Client without connecting to a real database.
RUN DATABASE_URL="postgresql://build_only:build_only@localhost:5432/build_only" \
    npx prisma generate --schema=../prisma/schema.prisma


EXPOSE 4000

# Start NestJS with development hot reload.
CMD ["npm", "run", "start:dev"]
