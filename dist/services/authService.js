"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
const logger_1 = require("../config/logger");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";
exports.authService = {
    register: async (email, password) => {
        // 1. Check if user already exists
        const existingUser = await userRepository_1.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        // 2. Hash the password (never store plain text passwords!)
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // 3. Save to database
        const newUser = await userRepository_1.userRepository.create(email, hashedPassword);
        logger_1.logger.info({ userId: newUser.id }, "New user registered");
        return { id: newUser.id, email: newUser.email };
    },
    login: async (email, password) => {
        // 1. Find user
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password"); // Vague error for security!
        }
        // 2. Compare passwords
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        // 3. Generate JWT (Valid for 7 days)
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        logger_1.logger.info({ userId: user.id }, "User logged in");
        return { token, user: { id: user.id, email: user.email } };
    },
};
