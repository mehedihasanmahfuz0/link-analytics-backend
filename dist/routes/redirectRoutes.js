"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redirectController_1 = require("../controllers/redirectController");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Public route: No authentication required!
router.get("/:shortCode", rateLimiter_1.redirectLimiter, (req, res, next) => {
    return redirectController_1.redirectController.handleRedirect(req, res, next);
});
exports.default = router;
