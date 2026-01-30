import { verifyToken } from "@clerk/backend";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No auth header" });
    }

    const token = header.replace("Bearer ", "");
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = payload.sub;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth verify failed:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
