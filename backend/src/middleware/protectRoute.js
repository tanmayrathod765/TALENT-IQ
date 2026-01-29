import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth({
    onError: (err, req, res) => {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }),

  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) {
        return res.status(401).json({ message: "No clerkId" });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();

    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Auth middleware error" });
    }
  }
];
