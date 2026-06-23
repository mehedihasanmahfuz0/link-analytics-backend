import { linkRepository } from '../repositories/linkRepository';
import { analyticsQueue } from '../config/queue';
import { redis } from '../config/redis';
import { Link } from '../generated/prisma/client';
import { logger } from '../config/logger';

const CACHE_TTL = 3600; // Cache links for 1 hour (in seconds)

export const linkService = {
  // 1. CREATE LINK (Also cache it immediately for faster first reads)
  createLink: async (userId: string, originalUrl: string): Promise<Link> => {
    let shortCode: string;
    let existing;

    do {
      shortCode = Math.random().toString(36).substring(2, 8);
      existing = await linkRepository.findByShortCode(shortCode);
    } while (existing);
    
    const newLink = await linkRepository.create({ shortCode, originalUrl, userId });
    
    // Pro move: Pre-warm the cache so the first visitor gets a fast redirect
    await redis.setex(`link:${shortCode}`, CACHE_TTL, JSON.stringify(newLink));
    logger.info({ linkId: newLink.id }, 'Service: Link created and cached');
    
    return newLink;
  },

  // 2. GET LINK FOR REDIRECT (The "Cache-Aside" Pattern)
  getLinkForRedirect: async (shortCode: string): Promise<Link | null> => {
    // Step A: Check Redis first (Lightning fast: ~1ms)
    const cachedLink = await redis.get(`link:${shortCode}`);
    if (cachedLink) {
      logger.info({ shortCode, source: 'cache' }, 'Service: Link fetched from cache');
      return JSON.parse(cachedLink) as Link;
    }

    // Step B: Cache miss. Check Database (Slower: ~10-50ms)
    const dbLink = await linkRepository.findByShortCode(shortCode);
    
    if (dbLink) {
      // Step C: Save to Redis for next time
      await redis.setex(`link:${shortCode}`, CACHE_TTL, JSON.stringify(dbLink));
      logger.info({ shortCode, source: 'database' }, 'Service: Link fetched from DB and cached');
    }

    return dbLink;
  },

  // 3. RECORD CLICK (Asynchronous via Queue) - UPDATED WITH ANALYTICS
  recordClick: async (shortCode: string, analyticsData: {
    deviceType: string;
    browser: string;
    os: string;
    country: string | null;
    city: string | null;
    ipAddress: string;
    referrer: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  }): Promise<void> => {
    // We DO NOT update the database here. We just push a message to the queue.
    await analyticsQueue.add('record-click', { 
      shortCode,
      analyticsData 
    });
    logger.info({ shortCode, device: analyticsData.deviceType }, 'Service: Click event pushed to queue');
  },

  getUserLinks: async (userId: string): Promise<Link[]> => {
    return linkRepository.findByUserId(userId);
  },
};
