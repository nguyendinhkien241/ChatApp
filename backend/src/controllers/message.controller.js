import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Fetch all users except the logged-in user
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -__v");

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    // Get messages between the logged-in user and the user they want to chat with
    const messages = await Message.find({
      $or: [
        { SenderId: myId, ReceiverId: userToChatId },
        { SenderId: userToChatId, ReceiverId: myId },
      ],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: ReceiverId } = req.params;
    const SenderId = req.user._id;

    let imageUrl;
    // Upload image to Cloudinary if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      text,
      SenderId,
      ReceiverId,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(ReceiverId);
    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
