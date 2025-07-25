import { StreamChat } from "stream-chat";
import "dotenv/config";

// Stream API credentials with your fresh keys
const apiKey = process.env.STREAM_API_KEY || "9nddtpt77s6p";
const apiSecret = process.env.STREAM_API_SECRET || "m7a3pa2bunu34bfj4c2mfa45d4kzaexc2tdamugpyuqy3wh9zhednh6f795m89sz";

console.log("🔑 Stream API Key:", apiKey ? `✅ Found: ${apiKey}` : "❌ Missing");
console.log("🔑 Stream API Secret:", apiSecret ? "✅ Found" : "❌ Missing");
console.log("🌍 Environment:", process.env.NODE_ENV || "development");

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