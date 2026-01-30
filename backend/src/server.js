import express from "express";
import path from "path";
import {ENV} from "./lib/env.js";
import {connectDB} from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express";
import {inngest,functions} from "./lib/inngest.js";
import {clerkMiddleware} from "@clerk/express";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

connectDB();
const app = express();

const __dirname = path.resolve();
console.log(ENV.PORT);

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));


app.use("/api/inngest",serve({client : inngest,functions}));
app.use(clerkMiddleware());
app.use("/api/chat",chatRoutes);
app.use("/api/sessions",sessionRoutes);

app.get("/",(req,res)=>
{
    res.status(200).json({
        message : "success"
    })
})
app.get("/video-call",protectRoute,(req,res)=>
{
    req.auth;
    res.status(200).json({
        message : "api is fetchedprotectedly"
    })
})

if(ENV.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("/{*any}",(req,res)=>
    {
        res.sendFile(path.resolve(__dirname,"../frontend","dist","index.html"));
    });

}



const startServer = async()=>
{
    try{
        await connectDB();
        app.listen(ENV.PORT,()=>
{
    console.log("Server is running on port :",ENV.PORT);
    connectDB();
})

    }
    catch(error)
    {
        console.log(error);
    }

}

startServer();