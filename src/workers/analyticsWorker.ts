import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const analyticsWorker = new Worker(
  'analytics-queue',
  async (job: Job) => {
    const { shortCode, analyticsData } = job.data;
    logger.info({ shortCode, jobId: job.id }, 'Worker: Processing click analytics');

    try {
      // 1. Find the link to get its ID
      const link = await prisma.link.findUnique({
        where: { shortCode },
        select: { id: true },
      });

      if (!link) {
        throw new Error(`Link with shortCode ${shortCode} not found`);
      }

      // 2. Create the click event record with all analytics data
      await prisma.clickEvent.create({
        data: {
          linkId: link.id,
          deviceType: analyticsData.deviceType,
          browser: analyticsData.browser,
          os: analyticsData.os,
          country: analyticsData.country,
          city: analyticsData.city,
          ipAddress: analyticsData.ipAddress,
          referrer: analyticsData.referrer,
          utmSource: analyticsData.utmSource,
          utmMedium: analyticsData.utmMedium,
          utmCampaign: analyticsData.utmCampaign,
        },
      });

      // 3. Also increment the total click count on the link
      await prisma.link.update({
        where: { shortCode },
        data: {
          clickCount: { increment: 1 },
        },
      });

      logger.info({ shortCode, country: analyticsData.country }, 'Worker: Click recorded with full analytics');
    } catch (error) {
      logger.error({ err: error, shortCode }, 'Worker: Failed to record click');
      throw error;
    }
  },
  {
    connection: redis.options,
    concurrency: 5,
  }
);

analyticsWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Worker: Job permanently failed');
});
