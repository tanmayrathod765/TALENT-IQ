export async function getStreamToken(req,res)
{
    try{
        const token = chatClient.Client.createToken(req.user.clerkId);
         res.status(200).json({
            token,
            userId : req.user.clerkId,
            userName : req.user.name,
            userImage : req.user.image,


         });
    }catch(error)
    {
              console.log(error);
        res.status(500).json({
            message : "Failed to get stream token"
        })
    }
}