# 1. Use a lightweight, secure Node.js base image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# 4. Copy source code
COPY . .

# 5. Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# 6. Production Stage (Multi-stage build keeps image small)
FROM node:20-alpine

WORKDIR /app

# Copy built files and production dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# 7. Run as a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 8. Expose port and start
EXPOSE 3000
CMD ["npm", "start"]