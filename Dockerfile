# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:22-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files 
# ⚠️ CRITICAL: This requires "package-lock.json" to exist and be exactly lowercase in your repo!
COPY package*.json ./

# 4. Install ALL dependencies (including devDependencies needed for building)
RUN npm install -g npm@11 && npm install

# 5. Copy source code
COPY . .

# 6. Build TypeScript (Prisma client is already pre-generated in source)
RUN npx tsc

# ==========================================
# 7. Production Stage
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# 8. Copy built assets and dependencies from the builder stage
# Copy package files first
COPY --from=builder /app/package*.json ./
# Copy node_modules from builder (ensures Prisma binaries perfectly match the Alpine OS)
COPY --from=builder /app/node_modules ./node_modules
# Copy compiled JavaScript
COPY --from=builder /app/dist ./dist
# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma

# 9. Run as a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 10. Expose port and start
EXPOSE 3000
CMD ["npm", "start"]