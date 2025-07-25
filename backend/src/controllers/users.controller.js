import User from "../models/user.model.js";

export const searchUserByCode = async (req, res) => {
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

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in searching user by code", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};