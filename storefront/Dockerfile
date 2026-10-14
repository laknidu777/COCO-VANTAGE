
FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies from the existing lockfile.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the storefront source code.
COPY . .

# Next.js development server port.
EXPOSE 3000

# Bind to all interfaces so Docker can expose the server.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
