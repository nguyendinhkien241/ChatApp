import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUsers = async (req, res) => {
  try {
    const { userCode } = req.query;
    const currentUserId = req.user._id;

    if (!userCode) {
      return res.status(400).json({ message: "User code is required" });
    }

    const user = await User.findOne({ 
      userCode: userCode,
      _id: { $ne: currentUserId }
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFriendship = await User.findById(currentUserId)
      .populate('friends', '_id');
    
    const isAlreadyFriend = existingFriendship.friends.some(
      friend => friend._id.toString() === user._id.toString()
    );

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: currentUserId, to: user._id },
        { from: user._id, to: currentUserId }
      ]
    });

    return res.status(200).json({
      user,
      isAlreadyFriend,
      hasExistingRequest: !!existingRequest,
      requestStatus: existingRequest?.status || null
    });
  } catch (error) {
    console.log("Error in searching users", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const currentUser = await User.findById(currentUserId);
    const isAlreadyFriend = currentUser.friends.includes(userId);
    if (isAlreadyFriend) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    const friendRequest = new FriendRequest({
      from: currentUserId,
      to: userId,
    });

    await friendRequest.save();
    await friendRequest.populate('from', 'fullName profilePic userCode');

    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", {
        request: friendRequest
      });
    }

    return res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sending friend request", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const currentUserId = req.user._id;

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'accept' or 'reject'" });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.to.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Unauthorized to respond to this request" });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: "Friend request has already been responded to" });
    }

    if (action === 'accept') {
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { friends: friendRequest.from }
      });
      await User.findByIdAndUpdate(friendRequest.from, {
        $addToSet: { friends: currentUserId }
      });
      
      friendRequest.status = 'accepted';
    } else {
      friendRequest.status = 'rejected';
    }

    await friendRequest.save();
    await friendRequest.populate('to', 'fullName profilePic userCode');

    const senderSocketId = getReceiverSocketId(friendRequest.from.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestResponse", {
        action,
        request: friendRequest
      });
    }

    return res.status(200).json({ 
      message: `Friend request ${action}ed successfully`,
      action 
    });
  } catch (error) {
    console.log("Error in responding to friend request", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const friendRequests = await FriendRequest.find({
      to: currentUserId,
      status: 'pending'
    }).populate('from', 'fullName profilePic userCode').sort({ createdAt: -1 });

    return res.status(200).json(friendRequests);
  } catch (error) {
    console.log("Error in getting friend requests", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId)
      .populate('friends', 'fullName profilePic userCode email')
      .select('friends');

    return res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getting friends", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};