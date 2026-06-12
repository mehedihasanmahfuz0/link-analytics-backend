"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const database_1 = require("../config/database");
exports.userRepository = {
    findByEmail: async (email) => {
        return database_1.prisma.user.findUnique({ where: { email } });
    },
    create: async (email, hashedPassword) => {
        return database_1.prisma.user.create({
            data: { email, password: hashedPassword },
        });
    },
};
