import { prisma } from "../config/database";

// PRO EXPLANATION: This layer ONLY knows how to talk to the database.
// It doesn't know what an HTTP request is. It just executes queries.

export const linkRepository = {
  create: async (data: {
    shortCode: string;
    originalUrl: string;
    userId: string;
  }) => {
    return prisma.link.create({ data });
  },

  findByUserId: async (userId: string) => {
    return prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByShortCode: async (shortCode: string) => {
    return prisma.link.findUnique({
      where: { shortCode },
    });
  },
};
