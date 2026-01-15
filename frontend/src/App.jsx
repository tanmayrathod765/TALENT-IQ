
import './App.css'
import { SignedIn, SignedOut, SignIn,SignOutButton, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  

  return (
    <>
        <h1>welcome to app</h1>
        <SignedOut>
        <SignInButton mode = "modal" />
        </SignedOut>

       

        <SignedIn>
          <SignOutButton/>
        </SignedIn>

       
          <UserButton />
        
         
    </>
  )
}

export default App
