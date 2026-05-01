ARG NODE_IMAGE=public.ecr.aws/docker/library/node:22.14.0-alpine

FROM $NODE_IMAGE AS base

# Set the user to root
USER root

# Install PM2 globally
RUN npm install -g pm2

# --- Builder Stage ---
FROM base AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . ./

# Build the application using Nx
RUN npm run build

# --- Runner Stage ---
FROM base AS runner

# Set the working directory
WORKDIR /usr/src/app

# Create logs directory and ensure proper ownership
RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=12288"

# Copy the build output from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Ensure ownership for non-root execution
RUN chown -R node:node /usr/src/app

# Copy PM2 configuration file
COPY pm2-config.yml ./

# Copy environment file (optional - for development only)
# COPY .env ./

# Expose the application port
EXPOSE 8000

# Start the application with PM2
CMD ["pm2-runtime", "start", "pm2-config.yml"]