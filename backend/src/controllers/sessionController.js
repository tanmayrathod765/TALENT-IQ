import Session from "../models/Session.js";
import { chatClient, streamClient } from "../lib/stream.js";
export async function createSession(req,res) {
    try {
        const {problem , difficulty} = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        if(!problem || !difficulty)
        {
            return res.status(400).json({message : "problem and difficulty are required"})
        }
          
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const session = await Session.create({
            problem,
            difficulty,
            host : userId,
            calId
        });

        await streamClient.video.call("default",callId).getOrCreate(
            {
                data : 
                {
                    created_by_id : clerkId,
                    custom : {
                        problem,
                        difficulty,
                        sessionId : session._id.toString()
                    },
                }
            }
        )
        
       const channel = chatClient.channel("messaging",callId,{
            name : `${problem} Session`,
            created_by_id : clerkId,
            members : [clerkId]
        })

        await channel.create();
         res.status(201).json({message : "session created successfully",session});
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({message : "something went wrong"})
    }
}

export async function getActiveSessions(_,res) {
    try {
        const sessions = await Session.find({status :"active"})
        .populate("host","name profileImage email clerkId")
        .sort({createdAt : -1})
        .limit(20);

     res.status(200).json({message : "active sessions fetched successfully",sessions});
    }
    catch(error)
    {
        console.log(error)
    }
}
export async function getMyRecentSessions(req,res) {
    try {
        const userId = req.user.id;
        const sessions = await Sessions.find({
            status : "completed",
            $or : [{host : userId},{participants : userId}],
        })
        .sort({updatedAt : -1})
        .limit(20);
        res.status(200).json({message : "my recent sessions fetched successfully",sessions});
    }
    catch(error)
    {
        console.log(error)
    }
}
export async function getSessionById(req,res) {
    try 
    {
        const { id } = req.params;
        const session = await Session.findById(id)
        .populate("host","name email profileImage  clerkId")
        .populate("participant","name email profileImage  clerkId");

        if(!session) return res.status(404).json({message : "session not found"});
        res.status(200).json({message : "session fetched successfully",session});
    }
    catch(error)
    {
        console.log(error)
    }   
}
export async function joinSession(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session  =await Session.findById(id);
        if(!session) return res.status(404).json({message : "session not found"});

        if(session.status !== "active")
        {
            return res.status(400).json({message : "session is not active"});
        }

        if(session.host.toString() === userId.toString())
        {
            return res.status(400).json({message : "host cannot join their own session as participant"});
        }

        if(session.participants)
        {
            return res.status(400).json({message : "session already has a participant"});
        }

        session.participants = userId;
        await session.save();

        const channel = chatClient.channel("messaging",session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({message : "session joined successfully",session});
    }
    catch(error)
    {
        console.log(error)
    }
} 
export async function endSession(req,res) {
    try 
    {
        const { id } = req.params;
        const userId = req.user._id;
        const session = await Session.findById(id);

        if(!session) return res.status(404).json({message : "session not found"});
        if(session.host.toString()!==userId,toString())
        {
            return res.status(403).json({message : "you are not authorized to end this session"});

        }

        if(session.status === "completed")
        {
             res.status(400).json({message : "session is already completed"});
        }

        

        const call = streamClient.video.call("default",session.callId);
        await call.delete({hard : true});

         const channel = chatClient.channel("messaging",session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({message : "session ended successfully",session});
    }
    catch(error)
    {
        console.log(error)
    
    }
}