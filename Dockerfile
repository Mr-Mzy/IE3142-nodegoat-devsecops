
# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /usr/src/app

# Copy package files first to improve build caching
COPY package.json package-lock.json ./

# Install exact production dependencies from the lockfile
RUN npm ci --omit=dev


# Stage 2: Build the production application image
FROM node:22-alpine

# Update npm to version 11
RUN npm install --global npm@11 \
    && mkdir -p /tmp/npm-patches \
    && npm install --prefix /tmp/npm-patches --no-save brace-expansion@5.0.12 undici@6.29.0 \
    && rm -rf /usr/local/lib/node_modules/npm/node_modules/brace-expansion \
              /usr/local/lib/node_modules/npm/node_modules/undici \
    && cp -R /tmp/npm-patches/node_modules/brace-expansion /usr/local/lib/node_modules/npm/node_modules/ \
    && cp -R /tmp/npm-patches/node_modules/undici /usr/local/lib/node_modules/npm/node_modules/ \
    && rm -rf /tmp/npm-patches

ENV NODE_ENV=production
ENV USER=node
ENV WORKDIR=/home/node/app

WORKDIR $WORKDIR

# Copy installed production dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy application source code with correct ownership
COPY --chown=node:node . .

# Run the application as a non-root user
USER node

# NodeGoat listens on port 4000
EXPOSE 4000

# Start NodeGoat
CMD ["npm", "start"]
