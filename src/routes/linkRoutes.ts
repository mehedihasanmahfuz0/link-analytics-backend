import { Router } from "express";
import { linkController } from "../controllers/linkController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// The 'authenticate' middleware runs BEFORE the controller.
router.post("/", authenticate, linkController.createLink);
router.get("/", authenticate, linkController.getUserLinks);

export default router;
