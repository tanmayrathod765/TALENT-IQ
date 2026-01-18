import "./App.css";
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import { useEffect } from "react";
import { testBackend } from "./api/testBackend";

function App() {
  useEffect(() => {
    testBackend();
  }, []);

  return (
    <>
      <h1>welcome to app</h1>

      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </>
  );
}

export default App;
