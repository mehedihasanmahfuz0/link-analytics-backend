"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = (req, res, next) => {
    // 1. Get token from headers (Format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ success: false, message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 3. Attach user ID to the request object so the controller can use it!
        req.user = { userId: decoded.userId };
        next(); // Proceed to the controller
    }
    catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token." });
    }
};
exports.authenticate = authenticate;
