import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getUserFriends, removeFriend } from "../lib/api";
import { Link } from "react-router";
import { ArrowLeftIcon, UserMinusIcon, MapPinIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { capitialize } from "../lib/utils";

const RemoveFriendsPage = () => {
  const queryClient = useQueryClient();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: removeFriendMutation, isPending: isRemoving } = useMutation({
    mutationFn: removeFriend,
    onSuccess: (data) => {
      toast.success(data.message || "Friend removed successfully");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowRemoveConfirm(false);
      setFriendToRemove(null);
    },
    onError: (error) => {
      console.error("Remove friend error:", error);
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      removeFriendMutation(friendToRemove._id);
    }
  };

  const cancelRemoveFriend = () => {
    setShowRemoveConfirm(false);
    setFriendToRemove(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/friends" className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="size-4" />
              </Link>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Remove Friends</h2>
            </div>
            <p className="opacity-70">
              Manage your friend connections - remove friends and delete conversations
            </p>
          </div>
        </div>

        {/* Friends List */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">👥</div>
              <h3 className="font-semibold text-xl">No friends yet</h3>
              <p className="text-base-content opacity-70 max-w-md mx-auto">
                You don't have any friends to remove. Go to the Friends page to add some friends first.
              </p>
              <Link to="/friends" className="btn btn-primary btn-sm">
                Find Friends
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Friends ({friends.length})</h3>
              <div className="badge badge-warning">
                ⚠️ Removing friends will delete all conversations
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="card-body p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar size-16 rounded-full">
                        <img src={friend.profilePic || "/default-avatar.png"} alt={friend.fullName} />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                        {friend.username && (
                          <p className="text-sm opacity-70">{friend.username}</p>
                        )}
                        {friend.location && (
                          <div className="flex items-center text-xs opacity-70 mt-1">
                            <MapPinIcon className="size-3 mr-1" />
                            {friend.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tech Stacks */}
                    <div className="space-y-2">
                      {/* Proficient Tech Stacks */}
                      {Array.isArray(friend.proficientTechStack) && friend.proficientTechStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-secondary">💻 Proficient:</span>
                          {friend.proficientTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-secondary badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {friend.proficientTechStack.length > 3 && (
                            <span className="badge badge-secondary badge-sm">+{friend.proficientTechStack.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Learning Tech Stacks */}
                      {Array.isArray(friend.learningTechStack) && friend.learningTechStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-accent">📚 Learning:</span>
                          {friend.learningTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-outline badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {friend.learningTechStack.length > 3 && (
                            <span className="badge badge-outline badge-sm">+{friend.learningTechStack.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {friend.bio && <p className="text-sm opacity-70">{friend.bio}</p>}

                    {/* Remove button */}
                    <button
                      className="btn btn-error btn-outline w-full mt-2"
                      onClick={() => handleRemoveFriend(friend)}
                      disabled={isRemoving}
                    >
                      <UserMinusIcon className="size-4 mr-2" />
                      Remove Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remove Friend Confirmation Modal */}
        {showRemoveConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-lg">Remove Friend</h3>
                  <p className="text-sm opacity-70">This action cannot be undone</p>
                </div>
              </div>
              
              {friendToRemove && (
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={friendToRemove.profilePic || "/default-avatar.png"} alt={friendToRemove.fullName} />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{friendToRemove.fullName}</p>
                      {friendToRemove.username && (
                        <p className="text-sm opacity-70">{friendToRemove.username}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <p>Are you sure you want to remove <strong>{friendToRemove?.fullName}</strong> from your friends list?</p>
                <div className="bg-warning/20 p-3 rounded-lg border border-warning/30">
                  <p className="text-sm">
                    <strong>This will:</strong>
                  </p>
                  <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                    <li>Remove them from your friends list</li>
                    <li>Delete all chat conversations between you two</li>
                    <li>They won't be blocked - you can reconnect later</li>
                  </ul>
                </div>
              </div>

              <div className="modal-action">
                <button 
                  className="btn btn-ghost" 
                  onClick={cancelRemoveFriend}
                  disabled={isRemoving}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-error" 
                  onClick={confirmRemoveFriend}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2Icon className="size-4 mr-2" />
                      Remove Friend
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveFriendsPage;
