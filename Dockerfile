# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["yarn", "dev:local"]

# Build stage
FROM base AS build
COPY . .
RUN yarn build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files for production dependencies
COPY package*.json ./
COPY yarn.lock ./

# Install only production dependencies
RUN yarn install --production && yarn cache clean

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["yarn", "start"]
