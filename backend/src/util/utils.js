import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  // Generate a JWT token for the user
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set the token in a cookie
  res.cookie("jwt", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie, prevent XSS attacks cross-site scripting
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Helps prevent CSRF attacks
  });

  return token;
};
