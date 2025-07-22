import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    console.log("Attempting to get auth user...");
    const res = await axiosInstance.get("/auth/me");
    console.log("✅ getAuthUser success:", res.data);
    return res.data;
  } catch (error) {
    console.log("❌ Error in getAuthUser:", error);
    console.log("Error response:", error.response?.data);
    console.log("Error status:", error.response?.status);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  try {
    console.log("Attempting to get Stream token...");
    const response = await axiosInstance.get("/chat/token");
    console.log("✅ getStreamToken success:", response.data);
    return response.data;
  } catch (error) {
    console.log("❌ Error in getStreamToken:", error);
    console.log("Error response:", error.response?.data);
    console.log("Error status:", error.response?.status);
    throw error;
  }
}

export async function ensureStreamUser(userId) {
  const response = await axiosInstance.post(`/chat/ensure-user/${userId}`);
  return response.data;
}

export async function createVideoCall(targetUserId) {
  const response = await axiosInstance.post("/chat/create-video-call", { targetUserId });
  return response.data;
}

// Username-related functions
export async function checkUsernameAvailability(username) {
  const response = await axiosInstance.get(`/auth/check-username/${username}`);
  return response.data;
}

export async function searchUserByUsername(username) {
  const response = await axiosInstance.get(`/auth/search-user/${username}`);
  return response.data;
}

export async function sendFriendRequestByUsername(username) {
  const response = await axiosInstance.post(`/users/friend-request/username/${username}`);
  return response.data;
}

export async function removeFriend(friendId) {
  const response = await axiosInstance.delete(`/users/friends/${friendId}`);
  return response.data;
}
