import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { ClerkProvider } from "@clerk/clerk-react"
import { BrowserRouter } from "react-router-dom"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth } from "@clerk/clerk-react";
import { setupAxiosAuth } from "./lib/setupAxiosAuth";
function AxiosAuthBridge() {
  const { getToken } = useAuth();
  setupAxiosAuth(getToken);
  return null;
}
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) throw new Error("Missing Publishable Key")

const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
         <AxiosAuthBridge />
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>
)
