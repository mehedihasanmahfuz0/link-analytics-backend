import { prisma } from '../config/database';

export const analyticsRepository = {
  // Get total clicks for a link
  getTotalClicks: async (linkId: string): Promise<number> => {
    return prisma.clickEvent.count({
      where: { linkId },
    });
  },

  // Get clicks grouped by country
  getClicksByCountry: async (linkId: string) => {
    return prisma.clickEvent.groupBy({
      by: ['country'],
      where: { linkId, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });
  },

  // Get clicks grouped by device type
  getClicksByDevice: async (linkId: string) => {
    return prisma.clickEvent.groupBy({
      by: ['deviceType'],
      where: { linkId },
      _count: { deviceType: true },
    });
  },

  // Get clicks grouped by browser
  getClicksByBrowser: async (linkId: string) => {
    return prisma.clickEvent.groupBy({
      by: ['browser'],
      where: { linkId },
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 10,
    });
  },

  // Get clicks grouped by referrer
  getClicksByReferrer: async (linkId: string) => {
    return prisma.clickEvent.groupBy({
      by: ['referrer'],
      where: { linkId },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10,
    });
  },

  // Get clicks per day for the last 30 days
  getClicksByDay: async (linkId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.$queryRaw<Array<{ date: Date; count: number }>>`
      SELECT 
        DATE("clickedAt") as date,
        COUNT(*)::int as count
      FROM "ClickEvent"
      WHERE "linkId" = ${linkId}
        AND "clickedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("clickedAt")
      ORDER BY date ASC
    `;

    return result;
  },

  // Get recent click events (last 100)
  getRecentClicks: async (linkId: string, limit: number = 100) => {
    return prisma.clickEvent.findMany({
      where: { linkId },
      orderBy: { clickedAt: 'desc' },
      take: limit,
    });
  },
};
