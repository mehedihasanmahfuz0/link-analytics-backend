import { Request, Response, NextFunction } from "express";
import { linkService } from "../services/linkService";

// PRO EXPLANATION: This layer ONLY handles HTTP (req, res).
// It just extracts data, calls the service, and sends the response.

export const linkController = {
  createLink: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Inside BOTH createLink and getUserLinks, replace:
      // const userId = 'temp-user-id';
      // WITH:
      const userId = req.user!.userId;

      const { originalUrl } = req.body;

      if (!originalUrl || typeof originalUrl !== "string") {
        return res.status(400).json({
          success: false,
          message: "originalUrl is required and must be a string",
        });
      }

      const newLink = await linkService.createLink(userId, originalUrl);

      return res.status(201).json({
        success: true,
        data: newLink,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserLinks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = "temp-user-id";

      const links = await linkService.getUserLinks(userId);

      return res.status(200).json({
        success: true,
        count: links.length,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  },
};
