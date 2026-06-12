"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectController = void 0;
const linkService_1 = require("../services/linkService");
const logger_1 = require("../config/logger");
exports.redirectController = {
    handleRedirect: async (req, res, next) => {
        try {
            let { shortCode } = req.params;
            if (!shortCode) {
                return res.status(400).json({
                    success: false,
                    message: "Short code is required",
                });
            }
            // FIX: Handle string | string[]
            const code = Array.isArray(shortCode) ? shortCode[0] : shortCode;
            // 1. Get link (cache or DB)
            const link = await linkService_1.linkService.getLinkForRedirect(code);
            if (!link || !link.isActive) {
                logger_1.logger.warn({ code }, "Redirect: Link not found or inactive");
                return res.status(404).json({
                    success: false,
                    message: "Link not found",
                });
            }
            // 2. Fire-and-forget analytics (non-blocking)
            linkService_1.linkService.recordClick(code).catch((err) => {
                logger_1.logger.error({ err, code }, "Redirect: Failed to queue click event");
            });
            // 3. Log redirect
            logger_1.logger.info({ code, destination: link.originalUrl }, "Redirect: Sending user to destination");
            // 4. Redirect user
            return res.redirect(302, link.originalUrl);
        }
        catch (error) {
            next(error);
        }
    },
};
