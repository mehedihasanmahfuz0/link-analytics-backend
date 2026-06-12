"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
exports.authController = {
    register: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.register(email, password);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.login(email, password);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
};
