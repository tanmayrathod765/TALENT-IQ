import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: {   // ✅ fixed spelling
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    callId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
