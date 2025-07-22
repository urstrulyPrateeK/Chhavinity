import { useStreamChat } from '../context/StreamChatContext';
import useAuthUser from '../hooks/useAuthUser';
import { getUserFriends } from '../lib/api';

class ChannelWatchService {
  constructor() {
    this.watchedChannels = new Set();
    this.isInitialized = false;
  }

  async initializeChannelWatching(chatClient, authUser) {
    if (this.isInitialized || !chatClient || !authUser) return;
    
    try {
      console.log("🔄 Initializing automatic channel watching for all friends...");
      
      // Get user's friends list
      const friends = await getUserFriends();
      console.log(`Found ${friends.length} friends to watch channels for`);
      
      // Watch channels for each friend
      for (const friend of friends) {
        await this.watchFriendChannel(chatClient, authUser._id, friend._id);
      }
      
      this.isInitialized = true;
      console.log("✅ All friend channels are now being watched for notifications");
      
    } catch (error) {
      console.error("❌ Error initializing channel watching:", error);
    }
  }

  async watchFriendChannel(chatClient, currentUserId, friendId) {
    try {
      // Create consistent channel ID
      const channelId = [currentUserId, friendId].sort().join('-');
      
      // Skip if already watching
      if (this.watchedChannels.has(channelId)) {
        return;
      }
      
      console.log(`🔍 Watching channel for friend: ${friendId}`);
      
      // Get or create the channel
      const channel = chatClient.channel('messaging', channelId, {
        members: [currentUserId, friendId],
        created_by_id: currentUserId
      });

      // Watch the channel (this enables notifications)
      await channel.watch({ user_id: currentUserId });
      
      // Mark as watched
      this.watchedChannels.add(channelId);
      
      console.log(`✅ Now watching channel: ${channelId}`);
      
    } catch (error) {
      console.error(`❌ Error watching channel for friend ${friendId}:`, error);
    }
  }

  async watchNewFriendChannel(chatClient, currentUserId, newFriendId) {
    // For when new friends are added
    await this.watchFriendChannel(chatClient, currentUserId, newFriendId);
  }

  reset() {
    this.watchedChannels.clear();
    this.isInitialized = false;
    console.log("🔄 Channel watch service reset");
  }
}

// Create singleton instance
const channelWatchService = new ChannelWatchService();

export default channelWatchService;
