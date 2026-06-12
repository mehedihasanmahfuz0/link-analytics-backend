import { Router } from "express";
import { linkController } from "../controllers/linkController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createLinkSchema } from "../validators/linkValidator";
import { linkCreationLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/", authenticate, linkCreationLimiter, validate(createLinkSchema), linkController.createLink);
router.get("/", authenticate, linkController.getUserLinks);

export default router;
