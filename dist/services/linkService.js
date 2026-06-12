"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkService = void 0;
const linkRepository_1 = require("../repositories/linkRepository");
const queue_1 = require("../config/queue");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
const CACHE_TTL = 3600; // 1 hour
exports.linkService = {
    // 1. CREATE LINK (cache warm + collision-safe shortCode)
    createLink: async (userId, originalUrl) => {
        let shortCode;
        let existing;
        // Avoid collisions
        do {
            shortCode = Math.random().toString(36).substring(2, 8);
            existing = await linkRepository_1.linkRepository.findByShortCode(shortCode);
        } while (existing);
        const newLink = await linkRepository_1.linkRepository.create({
            shortCode,
            originalUrl,
            userId,
        });
        // Cache warm (Redis SET with TTL)
        await redis_1.redis.set(`link:${shortCode}`, JSON.stringify(newLink), "EX", CACHE_TTL);
        logger_1.logger.info({ linkId: newLink.id }, "Service: Link created and cached");
        return newLink;
    },
    // 2. GET LINK FOR REDIRECT (Cache-Aside Pattern)
    getLinkForRedirect: async (shortCode) => {
        // Step A: Check Redis cache
        const cachedLink = await redis_1.redis.get(`link:${shortCode}`);
        if (cachedLink) {
            try {
                logger_1.logger.info({ shortCode, source: "cache" }, "Service: Link fetched from cache");
                return JSON.parse(cachedLink);
            }
            catch (err) {
                logger_1.logger.error({ err, shortCode }, "Cache parse failed, falling back to DB");
            }
        }
        // Step B: DB fallback
        const dbLink = await linkRepository_1.linkRepository.findByShortCode(shortCode);
        if (dbLink) {
            // Step C: re-cache for next requests
            await redis_1.redis.set(`link:${shortCode}`, JSON.stringify(dbLink), "EX", CACHE_TTL);
            logger_1.logger.info({ shortCode, source: "database" }, "Service: Link fetched from DB and cached");
        }
        return dbLink;
    },
    // 3. RECORD CLICK (async queue)
    recordClick: async (shortCode) => {
        await queue_1.analyticsQueue.add("record-click", { shortCode }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
        logger_1.logger.info({ shortCode }, "Service: Click event pushed to queue");
    },
    // 4. GET USER LINKS
    getUserLinks: async (userId) => {
        return linkRepository_1.linkRepository.findByUserId(userId);
    },
};
