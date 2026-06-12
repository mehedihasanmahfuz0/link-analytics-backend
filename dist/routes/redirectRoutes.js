"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redirectController_1 = require("../controllers/redirectController");
const router = (0, express_1.Router)();
// Public route: No authentication required!
router.get("/:shortCode", (req, res, next) => {
    return redirectController_1.redirectController.handleRedirect(req, res, next);
});
exports.default = router;
