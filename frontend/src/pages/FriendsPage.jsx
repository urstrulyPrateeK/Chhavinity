import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, HomeIcon, Edit2Icon, SearchIcon, UserIcon } from "lucide-react";
import toast from "react-hot-toast";

import { capitialize } from "../lib/utils";
import useAuthUser from "../hooks/useAuthUser";
import EditProfileModal from "../components/EditProfileModal";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Username search state
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const { mutate: sendRequestByUsernameMutation, isPending: isSendingByUsername } = useMutation({
    mutationFn: async (username) => {
      const response = await fetch(`http://localhost:5001/api/users/friend-request/username/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send friend request");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      // Update search result to show request sent
      if (searchResult) {
        setSearchResult({ ...searchResult, isAlreadyFriend: true });
      }
    },
    onError: (error) => {
      console.error("Friend request error:", error);
      toast.error(error.message || "Failed to send friend request");
    },
  });

  // Search for user by username - simplified
  const searchUserByUsername = async (username) => {
    if (!username.trim()) {
      setSearchResult(null);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`http://localhost:5001/api/auth/search-user/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
      
      if (response.status === 404) {
        setSearchResult(null);
        setSearchError("User not found");
      } else if (response.status === 401) {
        setSearchResult(null);
        setSearchError("Please login to search users");
      } else if (!response.ok) {
        setSearchResult(null);
        setSearchError("Search failed");
      } else {
        const data = await response.json();
        setSearchResult(data.user);
        setSearchError("");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult(null);
      setSearchError("Error searching for user");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchUserByUsername(searchUsername);
  };

  const handleSendRequestByUsername = () => {
    if (searchResult && searchResult.username) {
      sendRequestByUsernameMutation(searchResult.username);
    }
  };

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
            <p className="opacity-70">
              Discover perfect tech partners based on your profile
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2Icon className="mr-2 size-4" />
              Edit Profile
            </button>
            <Link to="/" className="btn btn-outline btn-sm">
              <HomeIcon className="mr-2 size-4" />
              My Friends
            </Link>
            <Link to="/notifications" className="btn btn-outline btn-sm">
              <UsersIcon className="mr-2 size-4" />
              Friend Requests
            </Link>
          </div>
        </div>

        {/* Username Search Section */}
        <div className="card bg-base-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SearchIcon className="size-5" />
              <h3 className="text-lg font-semibold">Find Friends by Username</h3>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-300">@</span>
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="input input-bordered flex-1"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSearching || !searchUsername.trim()}
              >
                {isSearching ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <SearchIcon className="size-4" />
                )}
                Search
              </button>
            </form>

            {/* Search Results */}
            {searchError && (
              <div className="alert alert-error">
                <span>{searchError}</span>
              </div>
            )}

            {searchResult && (
              <div className="card bg-base-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        <img
                          src={searchResult.profilePic || "/default-avatar.png"}
                          alt={searchResult.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{searchResult.fullName}</h4>
                      <p className="text-sm opacity-70">@{searchResult.username}</p>
                      {searchResult.bio && (
                        <p className="text-sm mt-1">{searchResult.bio}</p>
                      )}
                      {searchResult.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="size-3" />
                          <span className="text-xs opacity-70">{searchResult.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {searchResult.isAlreadyFriend ? (
                      <span className="badge badge-success">Friends</span>
                    ) : outgoingRequestsIds.has(searchResult._id) ? (
                      <span className="badge badge-warning">Request Sent</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleSendRequestByUsername}
                        disabled={isSendingByUsername}
                      >
                        {isSendingByUsername ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-1" />
                            Send Request
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Tech Stacks */}
                {(searchResult.proficientTechStack?.length > 0 || searchResult.learningTechStack?.length > 0) && (
                  <div className="mt-4 space-y-2">
                    {searchResult.proficientTechStack?.length > 0 && (
                      <div>
                        <span className="text-xs font-medium opacity-70">PROFICIENT IN:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {searchResult.proficientTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-success badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {searchResult.proficientTechStack.length > 3 && (
                            <span className="badge badge-ghost badge-sm">
                              +{searchResult.proficientTechStack.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {searchResult.learningTechStack?.length > 0 && (
                      <div>
                        <span className="text-xs font-medium opacity-70">LEARNING:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {searchResult.learningTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-info badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {searchResult.learningTechStack.length > 3 && (
                            <span className="badge badge-ghost badge-sm">
                              +{searchResult.learningTechStack.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : recommendedUsers.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="font-semibold text-xl">No recommendations available</h3>
              <p className="text-base-content opacity-70 max-w-md mx-auto">
                Check back later for new tech partners! Make sure you've completed your profile to get better recommendations.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2Icon className="mr-2 size-4" />
                Update Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

              return (
                <div
                  key={user._id}
                  className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="card-body p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar size-16 rounded-full">
                        <img src={user.profilePic} alt={user.fullName} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">{user.fullName}</h3>
                        {user.location && (
                          <div className="flex items-center text-xs opacity-70 mt-1">
                            <MapPinIcon className="size-3 mr-1" />
                            {user.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tech Stacks */}
                    <div className="space-y-2">
                      {/* Proficient Tech Stacks */}
                      {Array.isArray(user.proficientTechStack) && user.proficientTechStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-secondary">💻 Proficient:</span>
                          {user.proficientTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-secondary badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {user.proficientTechStack.length > 3 && (
                            <span className="badge badge-secondary badge-sm">+{user.proficientTechStack.length - 3}</span>
                          )}
                        </div>
                      )}
                      {!Array.isArray(user.proficientTechStack) && user.proficientTechStack && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-secondary">💻 Proficient:</span>
                          <span className="badge badge-secondary badge-sm">
                            {capitialize(user.proficientTechStack)}
                          </span>
                        </div>
                      )}
                      
                      {/* Learning Tech Stacks */}
                      {Array.isArray(user.learningTechStack) && user.learningTechStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-accent">📚 Learning:</span>
                          {user.learningTechStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="badge badge-outline badge-sm">
                              {capitialize(tech)}
                            </span>
                          ))}
                          {user.learningTechStack.length > 3 && (
                            <span className="badge badge-outline badge-sm">+{user.learningTechStack.length - 3}</span>
                          )}
                        </div>
                      )}
                      {!Array.isArray(user.learningTechStack) && user.learningTechStack && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium text-accent">📚 Learning:</span>
                          <span className="badge badge-outline badge-sm">
                            {capitialize(user.learningTechStack)}
                          </span>
                        </div>
                      )}
                    </div>

                    {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                    {/* Action button */}
                    <button
                      className={`btn w-full mt-2 ${
                        hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                      } `}
                      onClick={() => sendRequestMutation(user._id)}
                      disabled={hasRequestBeenSent || isPending}
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircleIcon className="size-4 mr-2" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-4 mr-2" />
                          Send Friend Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={authUser}
        />
      </div>
    </div>
  );
};

export default FriendsPage;
