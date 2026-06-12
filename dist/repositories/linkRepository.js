"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkRepository = void 0;
const database_1 = require("../config/database");
// PRO EXPLANATION: This layer ONLY knows how to talk to the database.
// It doesn't know what an HTTP request is. It just executes queries.
exports.linkRepository = {
    create: async (data) => {
        return database_1.prisma.link.create({ data });
    },
    findByUserId: async (userId) => {
        return database_1.prisma.link.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },
    findByShortCode: async (shortCode) => {
        return database_1.prisma.link.findUnique({
            where: { shortCode },
        });
    },
};
