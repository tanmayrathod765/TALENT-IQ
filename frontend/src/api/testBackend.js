import { BACKEND_URL } from "../config";

export async function testBackend() {
  if (!BACKEND_URL) {
    console.log("❌ BACKEND_URL missing. Add VITE_BACKEND_URL in Vercel env.");
    return;
  }

  const res = await fetch(`${BACKEND_URL}/`, {
    method: "GET",
  });

  const data = await res.json();
  console.log("✅ Backend response:", data);
}
