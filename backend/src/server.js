import express from "express";
import path from "path";
import cors from "cors";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

import { clerkMiddleware } from "@clerk/express";
import { protectRoute } from "./middleware/protectRoute.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();
const __dirname = path.resolve();

console.log("PORT:", ENV.PORT);


// ✅ CORS — allow localhost + vercel frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://talent-iq-five.vercel.app", // ← your vercel domain
    ],
    credentials: true,
  })
);

// ✅ body parser
app.use(express.json());


// ✅ IMPORTANT — Clerk middleware BEFORE routes
app.use(clerkMiddleware());


// ✅ API routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/inngest", serve({ client: inngest, functions }));


// ✅ health route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API running",
  });
});


// ✅ protected test route
app.get("/api/video-call", protectRoute, (req, res) => {
  res.status(200).json({
    message: "Protected route working",
  });
});


// ❌ DO NOT serve frontend here (Vercel already serves it)
// ❌ removed static + wildcard routes


// ✅ server start
const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log("Server running on port:", ENV.PORT);
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
};

startServer();
