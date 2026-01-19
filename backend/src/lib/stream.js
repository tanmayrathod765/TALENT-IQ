import {StreamChat} from 'stream-chat';
import {ENV}  from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
  console.warn("⚠️ STREAM_API_KEY or STREAM_API_SECRET is missing in environment variables.");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try{
        await chatClient.upsertUser(userData);
            return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
        throw error; 
    }
};

export const deleteStreamUser = async (userId) => {
    try{
        await chatClient.deleteUser(userId);
            console.log(`User with ID ${userId} deleted successfully.`);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
        throw error; 
    }
};
