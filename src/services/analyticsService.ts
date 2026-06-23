import UAParser from 'ua-parser-js';
import { open, Reader } from 'maxmind';
import type { CityResponse } from 'mmdb-lib';
import path from 'path';
import { logger } from '../config/logger';
import { analyticsRepository } from '../repositories/analyticsRepository';

// Initialize GeoIP reader (loads database into memory for fast lookups)
let geoReader: Reader<CityResponse> | null = null;

const initGeoReader = async () => {
  if (geoReader) return geoReader;
  
  try {
    const dbPath = path.join(process.cwd(), 'data', 'GeoLite2-City.mmdb');
    geoReader = await open<CityResponse>(dbPath);
    logger.info('[GEO] GeoIP database loaded successfully');
    return geoReader;
  } catch (error) {
    logger.warn('[GEO] GeoIP database not found, geolocation disabled. Download from https://dev.maxmind.com/geoip/geolite2-free-geolocation-data');
    return null;
  }
};

export const analyticsService = {
  // Parse User-Agent string to extract device/browser/OS
  parseUserAgent: (userAgent: string) => {
    const parser = new UAParser.UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'unknown',
      os: result.os.name || 'unknown',
    };
  },

  // Get geographic location from IP address
  getGeoLocation: async (ip: string): Promise<{ country: string | null; city: string | null }> => {
    const reader = await initGeoReader();
    
    if (!reader) {
      return { country: null, city: null };
    }

    try {
      const geoData = reader.get(ip);
      
      if (!geoData) {
        return { country: null, city: null };
      }

      return {
        country: geoData.country?.names?.en || null,
        city: geoData.city?.names?.en || null,
      };
    } catch (error) {
      logger.error({ err: error, ip }, '[GEO] Failed to lookup IP');
      return { country: null, city: null };
    }
  },

  // Extract referrer domain from full URL
  parseReferrer: (referrer: string | undefined): string => {
    if (!referrer || referrer === '') {
      return 'direct';
    }

    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  },

  // Extract UTM parameters from URL query string
  extractUTMParams: (queryString: string): { utmSource: string | null; utmMedium: string | null; utmCampaign: string | null } => {
    const params = new URLSearchParams(queryString);
    
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    };
  },

  // Get comprehensive analytics for a link
  getLinkAnalytics: async (linkId: string) => {
    const [
      totalClicks,
      byCountry,
      byDevice,
      byBrowser,
      byReferrer,
      byDay,
      recentClicks,
    ] = await Promise.all([
      analyticsRepository.getTotalClicks(linkId),
      analyticsRepository.getClicksByCountry(linkId),
      analyticsRepository.getClicksByDevice(linkId),
      analyticsRepository.getClicksByBrowser(linkId),
      analyticsRepository.getClicksByReferrer(linkId),
      analyticsRepository.getClicksByDay(linkId),
      analyticsRepository.getRecentClicks(linkId),
    ]);

    return {
      totalClicks,
      byCountry: byCountry.map(item => ({
        country: item.country,
        count: item._count.country,
      })),
      byDevice: byDevice.map(item => ({
        device: item.deviceType,
        count: item._count.deviceType,
      })),
      byBrowser: byBrowser.map(item => ({
        browser: item.browser,
        count: item._count.browser,
      })),
      byReferrer: byReferrer.map(item => ({
        referrer: item.referrer,
        count: item._count.referrer,
      })),
      byDay,
      recentClicks: recentClicks.slice(0, 10),
    };
  },
};
