import { Router, Request, Response, NextFunction } from "express";
import { redirectController } from "../controllers/redirectController";
import { redirectLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Public route: No authentication required!
router.get("/:shortCode", redirectLimiter, (req: Request, res: Response, next: NextFunction) => {
  return redirectController.handleRedirect(req, res, next);
});

export default router;
