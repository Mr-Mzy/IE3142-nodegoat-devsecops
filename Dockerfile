# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /usr/src/app

# Copy package files first to improve build caching
COPY package.json package-lock.json ./

# Install exact dependencies from the lockfile
RUN npm ci --omit=dev


# Stage 2: Build the production application image
FROM node:22-alpine

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

