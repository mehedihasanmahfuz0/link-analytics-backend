import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include our user (TypeScript magic!)
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key-change-in-production";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 3. Attach user ID to the request object so the controller can use it!
    req.user = { userId: decoded.userId };

    next(); // Proceed to the controller
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};
