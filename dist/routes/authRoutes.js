"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middlewares/validate");
const authValidator_1 = require("../validators/authValidator");
const router = (0, express_1.Router)();
// Notice how we chain the validate middleware BEFORE the controller!
router.post("/register", (0, validate_1.validate)(authValidator_1.registerSchema), authController_1.authController.register);
router.post("/login", (0, validate_1.validate)(authValidator_1.loginSchema), authController_1.authController.login);
exports.default = router;
