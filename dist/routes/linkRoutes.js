"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkController_1 = require("../controllers/linkController");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
// The 'authenticate' middleware runs BEFORE the controller.
router.post("/", authenticate_1.authenticate, linkController_1.linkController.createLink);
router.get("/", authenticate_1.authenticate, linkController_1.linkController.getUserLinks);
exports.default = router;
