import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  login,
  register,
  logout,
  updateProfile,
  changePassword,
  checkAuth,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.put("/updateProfile", protectRoute, updateProfile);
router.put("/changePassword", protectRoute, changePassword);

router.get("/check", protectRoute, checkAuth);
export default router;
