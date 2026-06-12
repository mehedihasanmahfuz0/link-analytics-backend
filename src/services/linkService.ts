import { linkRepository } from "../repositories/linkRepository";
import { analyticsQueue } from "../config/queue";
import { redis } from "../config/redis";
import { Link } from "../generated/prisma/client";
import { logger } from "../config/logger";

const CACHE_TTL = 3600; // 1 hour

export const linkService = {
  // 1. CREATE LINK (cache warm + collision-safe shortCode)
  createLink: async (userId: string, originalUrl: string): Promise<Link> => {
    let shortCode: string;
    let existing;

    // Avoid collisions
    do {
      shortCode = Math.random().toString(36).substring(2, 8);
      existing = await linkRepository.findByShortCode(shortCode);
    } while (existing);

    const newLink = await linkRepository.create({
      shortCode,
      originalUrl,
      userId,
    });

    // Cache warm (Redis SET with TTL)
    await redis.set(
      `link:${shortCode}`,
      JSON.stringify(newLink),
      "EX",
      CACHE_TTL,
    );

    logger.info({ linkId: newLink.id }, "Service: Link created and cached");

    return newLink;
  },

  // 2. GET LINK FOR REDIRECT (Cache-Aside Pattern)
  getLinkForRedirect: async (shortCode: string): Promise<Link | null> => {
    // Step A: Check Redis cache
    const cachedLink = await redis.get(`link:${shortCode}`);

    if (cachedLink) {
      try {
        logger.info(
          { shortCode, source: "cache" },
          "Service: Link fetched from cache",
        );
        return JSON.parse(cachedLink) as Link;
      } catch (err) {
        logger.error(
          { err, shortCode },
          "Cache parse failed, falling back to DB",
        );
      }
    }

    // Step B: DB fallback
    const dbLink = await linkRepository.findByShortCode(shortCode);

    if (dbLink) {
      // Step C: re-cache for next requests
      await redis.set(
        `link:${shortCode}`,
        JSON.stringify(dbLink),
        "EX",
        CACHE_TTL,
      );

      logger.info(
        { shortCode, source: "database" },
        "Service: Link fetched from DB and cached",
      );
    }

    return dbLink;
  },

  // 3. RECORD CLICK (async queue)
  recordClick: async (shortCode: string): Promise<void> => {
    await analyticsQueue.add(
      "record-click",
      { shortCode },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    logger.info({ shortCode }, "Service: Click event pushed to queue");
  },

  // 4. GET USER LINKS
  getUserLinks: async (userId: string): Promise<Link[]> => {
    return linkRepository.findByUserId(userId);
  },
};
