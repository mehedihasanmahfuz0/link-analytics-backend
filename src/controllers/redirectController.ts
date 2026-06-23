import { Request, Response, NextFunction } from 'express';
import { linkService } from '../services/linkService';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../config/logger';

export const redirectController = {
  handleRedirect: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shortCodeParam = req.params.shortCode;
      const shortCode = Array.isArray(shortCodeParam) ? shortCodeParam[0] : shortCodeParam;

      // 1. Get the link (from Cache or DB)
      const link = await linkService.getLinkForRedirect(shortCode);

      if (!link || !link.isActive) {
        logger.warn({ shortCode }, 'Redirect: Link not found or inactive');
        return res.status(404).json({ success: false, message: 'Link not found' });
      }

      // 2. Extract analytics data from the request
      const userAgent = (req.headers['user-agent'] as string) || '';
      const referrer = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || '';
      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || 
                 req.socket.remoteAddress || 
                 'unknown';
      
      // Parse all the analytics data
      const { deviceType, browser, os } = analyticsService.parseUserAgent(userAgent);
      const { country, city } = await analyticsService.getGeoLocation(ip);
      const referrerDomain = analyticsService.parseReferrer(referrer);
      const { utmSource, utmMedium, utmCampaign } = analyticsService.extractUTMParams(req.url);

      // 3. Record the click with ALL analytics data (asynchronous)
      linkService.recordClick(shortCode, {
        deviceType,
        browser,
        os,
        country,
        city,
        ipAddress: ip,
        referrer: referrerDomain,
        utmSource,
        utmMedium,
        utmCampaign,
      }).catch((err) => {
        logger.error({ err, shortCode }, 'Redirect: Failed to queue click event');
      });

      // 4. Redirect the user immediately
      logger.info({ 
        shortCode, 
        destination: link.originalUrl,
        device: deviceType,
        country 
      }, 'Redirect: Sending user to destination');
      
      return res.redirect(302, link.originalUrl);

    } catch (error) {
      next(error);
    }
  },
};
