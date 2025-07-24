import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // Check if token is provided
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if the token is valid
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    // Find the user associated with the token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
