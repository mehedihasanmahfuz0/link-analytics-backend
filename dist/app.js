"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const env_1 = require("./config/env"); // Import validated env
const linkRoutes_1 = __importDefault(require("./routes/linkRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const redirectRoutes_1 = __importDefault(require("./routes/redirectRoutes"));
const app = (0, express_1.default)();
// 1. Security Headers (Helmet)
app.use((0, helmet_1.default)());
// 2. CORS (Configure based on environment)
const allowedOrigins = env_1.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"] // REPLACE THIS IN PRODUCTION
    : ["http://localhost:3000", "http://localhost:5173"]; // Vite/React defaults
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// 3. Body Parsing
app.use(express_1.default.json());
// 4. Health Check (Good for cloud provider uptime monitors)
app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        environment: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
// 5. Routes
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/links", linkRoutes_1.default);
app.use("/p", redirectRoutes_1.default);
// 6. Global Error Handler (Must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
