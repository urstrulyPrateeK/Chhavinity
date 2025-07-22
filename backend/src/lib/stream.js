import { StreamChat } from "stream-chat";
import "dotenv/config";

// Stream API credentials with fallbacks for testing
const apiKey = process.env.STREAM_API_KEY || "8br4watd788t";
const apiSecret = process.env.STREAM_API_SECRET || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dldHN0cmVhbS5pbyIsInN1YiI6InVzZXIvMTE2NjU1OCIsInVzZXJfaWQiOiIxMTY2NTU4IiwiaWF0IjoxNzE4NTI5MTcyLCJleHAiOjE3MTkxMzM5NzN9.6NkPSe6mN4VtlaXa6yGxG9oBHxFdUqMhUKVPdnP8V5I";

console.log("🔑 Stream API Key:", apiKey ? "✅ Found" : "❌ Missing");
console.log("🔑 Stream API Secret:", apiSecret ? "✅ Found" : "❌ Missing");

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret, {
  timeout: 10000, // 10 seconds timeout
  logger: (logLevel, message, extraData) => {
    if (logLevel === 'error') {
      console.error('Stream error:', message, extraData);
    }
  }
});

export const getStreamClient = () => {
  return streamClient;
};

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};