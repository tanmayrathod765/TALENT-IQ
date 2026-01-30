import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Auth middleware error" });
  }
};
