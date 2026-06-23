import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { linkRepository } from '../repositories/linkRepository';

export const analyticsController = {
  getLinkAnalytics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shortCodeParam = req.params.shortCode;
      const shortCode = Array.isArray(shortCodeParam) ? shortCodeParam[0] : shortCodeParam;
      const userId = req.user!.userId;

      // Verify the link belongs to this user
      const link = await linkRepository.findByShortCode(shortCode);
      
      if (!link) {
        return res.status(404).json({ success: false, message: 'Link not found' });
      }

      if (link.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const analytics = await analyticsService.getLinkAnalytics(link.id);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
};
