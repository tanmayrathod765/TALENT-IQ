import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user.clerkId;

    if (!userId) {
      return res.status(400).json({
        message: "Missing clerkId",
      });
    }

    const token = chatClient.createToken(userId);   // ✅ FIXED

    res.status(200).json({
      token,
      userId,
      userName: req.user.name,
      userImage: req.user.image,
    });

  } catch (error) {
  console.log("STREAM TOKEN FULL ERROR:", error.message);
  console.log(error.stack);

  res.status(500).json({
    message: error.message
  });
}

}
