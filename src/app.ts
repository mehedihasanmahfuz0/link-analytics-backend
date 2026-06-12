import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";
import { apiLimiter } from "./middlewares/rateLimiter";
import linkRoutes from "./routes/linkRoutes";
import authRoutes from "./routes/authRoutes";
import redirectRoutes from "./routes/redirectRoutes";

const app: Express = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS (Configure based on environment)
const allowedOrigins =
  env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"] // REPLACE THIS IN PRODUCTION
    : ["http://localhost:3000", "http://localhost:5173"]; // Vite/React defaults

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// 3. Body Parsing (with size limit to prevent memory exhaustion)
app.use(express.json({ limit: "1mb" }));

// 4. Health Check (Good for cloud provider uptime monitors)
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 5. Rate Limiting (applied per-route group)
app.use("/api/v1/auth", apiLimiter, authRoutes);
app.use("/api/v1/links", apiLimiter, linkRoutes);
app.use("/p", redirectRoutes);

// 6. Global Error Handler (Must be last)
app.use(errorHandler);

export default app;
