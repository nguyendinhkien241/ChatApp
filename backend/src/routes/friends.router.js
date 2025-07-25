import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  searchUsers, 
  sendFriendRequest, 
  respondToFriendRequest, 
  getFriendRequests,
  getFriends 
} from "../controllers/friends.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.post("/request", protectRoute, sendFriendRequest);
router.put("/request/:requestId", protectRoute, respondToFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);
router.get("/", protectRoute, getFriends);

export default router;