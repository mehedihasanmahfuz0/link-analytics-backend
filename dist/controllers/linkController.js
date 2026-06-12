"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkController = void 0;
const linkService_1 = require("../services/linkService");
// PRO EXPLANATION: This layer ONLY handles HTTP (req, res).
// It just extracts data, calls the service, and sends the response.
exports.linkController = {
    createLink: async (req, res, next) => {
        try {
            // Inside BOTH createLink and getUserLinks, replace:
            // const userId = 'temp-user-id';
            // WITH:
            const userId = req.user.userId;
            const { originalUrl } = req.body;
            if (!originalUrl || typeof originalUrl !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "originalUrl is required and must be a string",
                });
            }
            const newLink = await linkService_1.linkService.createLink(userId, originalUrl);
            return res.status(201).json({
                success: true,
                data: newLink,
            });
        }
        catch (error) {
            next(error);
        }
    },
    getUserLinks: async (req, res, next) => {
        try {
            const userId = "temp-user-id";
            const links = await linkService_1.linkService.getUserLinks(userId);
            return res.status(200).json({
                success: true,
                count: links.length,
                data: links,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
