import { prisma } from "../config/database";
import { User } from "../generated/prisma/client"; // Updated Prisma 7 import!

export const userRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { email } });
  },
  create: async (email: string, hashedPassword: string): Promise<User> => {
    return prisma.user.create({
      data: { email, password: hashedPassword },
    });
  },
};
