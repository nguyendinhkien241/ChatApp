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
    const { profilePic } = req.body;
    const userId = req.user._id;
    // Validate required fields
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide profile picture" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: updateUser._id,
      email: updateUser.email,
      fullName: updateUser.fullName,
      profilePic: updateUser.profilePic,
    });
  } catch (error) {
    console.log("Error in updating profile", error.message);
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
