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
    const { text, image, file, audio } = req.body;
    const { id: ReceiverId } = req.params;
    const SenderId = req.user._id;

    console.log('Received message data:', { text, hasImage: !!image, hasFile: !!file, hasAudio: !!audio });

    let imageUrl;
    let fileData;
    let audioData;

    // Upload image to Cloudinary if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Upload file to Cloudinary if provided
    if (file && file.data) {
      console.log('Uploading file:', file.name, file.type);
      const uploadResponse = await cloudinary.uploader.upload(file.data, {
        resource_type: "auto",
        public_id: `files/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      fileData = {
        url: uploadResponse.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
      };
      console.log('File uploaded successfully:', uploadResponse.secure_url);
    }

    // Upload audio to Cloudinary if provided
    if (audio && audio.data) {
      console.log('Uploading audio, duration:', audio.duration, 'type:', typeof audio.duration);
      const uploadResponse = await cloudinary.uploader.upload(audio.data, {
        resource_type: "video", // Cloudinary uses 'video' for audio files
        public_id: `audio/${Date.now()}_audio`,
      });
      
      // Ensure duration is a number
      const duration = parseInt(audio.duration) || 0;
      audioData = {
        url: uploadResponse.secure_url,
        duration: duration,
      };
      console.log('Audio uploaded successfully:', uploadResponse.secure_url, 'with duration:', duration);
    }

    const newMessage = new Message({
      text,
      SenderId,
      ReceiverId,
      image: imageUrl,
      file: fileData,
      audio: audioData,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(ReceiverId);
    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
