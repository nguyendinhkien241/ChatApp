import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../util/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password" });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Generate token and respond
    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      gender: user.gender,
      userCode: user.userCode,
      friends: user.friends,
    });
  } catch (error) {
    console.log("Error in user login", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    // Validate required fields
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    // Check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    // Check if user already exists
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });
    // Save the new user to the database
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
        dateOfBirth: newUser.dateOfBirth,
        bio: newUser.bio,
        gender: newUser.gender,
        userCode: newUser.userCode,
        friends: newUser.friends,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in registering user", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in user logout", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic, dateOfBirth, bio, gender } = req.body;
    const userId = req.user._id;

    const updateData = {};

    // Update fullName if provided
    if (fullName) {
      updateData.fullName = fullName;
    }

    // Update profilePic if provided
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    // Update dateOfBirth if provided
    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    // Update bio if provided
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Update gender if provided
    if (gender !== undefined) {
      updateData.gender = gender;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: updatedUser._id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      profilePic: updatedUser.profilePic,
      dateOfBirth: updatedUser.dateOfBirth,
      bio: updatedUser.bio,
      gender: updatedUser.gender,
      userCode: updatedUser.userCode,
      friends: updatedUser.friends,
    });
  } catch (error) {
    console.log("Error in updating profile", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Please provide both current and new password" 
      });
    }

    // Check new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in changing password", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checking authentication", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
