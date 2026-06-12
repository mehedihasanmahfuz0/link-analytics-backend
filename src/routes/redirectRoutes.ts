import { Router, Request, Response, NextFunction } from "express";
import { redirectController } from "../controllers/redirectController";

const router = Router();

// Public route: No authentication required!
router.get("/:shortCode", (req: Request, res: Response, next: NextFunction) => {
  return redirectController.handleRedirect(req, res, next);
});

export default router;
