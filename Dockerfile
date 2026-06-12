# 1. Use a lightweight, secure Node.js base image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install ALL dependencies (including devDeps for build)
COPY package*.json ./
RUN npm ci

# 4. Copy source code
COPY . .

# 5. Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# 6. Production Stage (Multi-stage build keeps image small)
FROM node:20-alpine

WORKDIR /app

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist
# Copy package files and install ONLY production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
# Copy Prisma schema for reference and generated client engine
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 7. Run as a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 8. Expose port and start
EXPOSE 3000
CMD ["npm", "start"]