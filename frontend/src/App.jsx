
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { testBackend } from "./api/testBackend";
import { Routes, Route, Navigate } from "react-router-dom";  
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import { Toaster } from "react-hot-toast";


function App() {
 
const { isSignedIn } = useUser(); 
  return (
    <>
    <Routes>
      
    
      <Route path="/" element={<HomePage />} />
     
      <Route path="/problems" element={isSignedIn ? <ProblemsPage />: <Navigate to = {"/"}/>} />
    </Routes>

    <Toaster/>

</>
    
  );
}

export default App;
