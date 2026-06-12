import { Request, Response, NextFunction } from "express";
import { linkService } from "../services/linkService";
import { logger } from "../config/logger";

export const redirectController = {
  handleRedirect: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shortCode } = req.params;

      if (!shortCode) {
        return res.status(400).json({
          success: false,
          message: "Short code is required",
        });
      }

      // FIX: Handle string | string[]
      const code = Array.isArray(shortCode) ? shortCode[0] : shortCode;

      // 1. Get link (cache or DB)
      const link = await linkService.getLinkForRedirect(code);

      if (!link || !link.isActive) {
        logger.warn({ code }, "Redirect: Link not found or inactive");

        return res.status(404).json({
          success: false,
          message: "Link not found",
        });
      }

      // 2. Fire-and-forget analytics (non-blocking)
      linkService.recordClick(code).catch((err) => {
        logger.error({ err, code }, "Redirect: Failed to queue click event");
      });

      // 3. Log redirect
      logger.info(
        { code, destination: link.originalUrl },
        "Redirect: Sending user to destination",
      );

      // 4. Redirect user
      return res.redirect(302, link.originalUrl);
    } catch (error) {
      next(error);
    }
  },
};
