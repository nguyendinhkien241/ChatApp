import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUserByCode } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUserByCode);

export default router;