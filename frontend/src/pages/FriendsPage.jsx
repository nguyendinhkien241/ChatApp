import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Search, UserPlus, Users, Check, X } from "lucide-react";

const FriendsPage = () => {
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  useEffect(() => {
    loadFriendRequests();
    loadFriends();
  }, []);

  const loadFriendRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await axiosInstance.get("/friends/requests");
      setFriendRequests(res.data);
    } catch (error) {
      toast.error("Failed to load friend requests" + error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const res = await axiosInstance.get("/friends");
      setFriends(res.data);
    } catch (error) {
      toast.error("Failed to load friends" + error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const searchUser = async () => {
    if (!searchCode.trim()) {
      toast.error("Please enter a user code");
      return;
    }

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/friends/search?userCode=${searchCode}`);
      setSearchResult(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axiosInstance.post("/friends/request", { userId });
      toast.success("Friend request sent!");
      setSearchResult(prev => ({
        ...prev,
        hasExistingRequest: true,
        requestStatus: "pending"
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  };

  const respondToFriendRequest = async (requestId, action) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}`, { action });
      toast.success(`Friend request ${action}ed!`);
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      if (action === "accept") {
        loadFriends();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} friend request`);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Friends</h1>

        {/* Search Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <Search className="w-5 h-5" />
              Search Users
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter user code..."
                className="input input-bordered flex-1"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUser()}
              />
              <button
                className={`btn btn-primary ${isSearching ? "loading" : ""}`}
                onClick={searchUser}
                disabled={isSearching}
              >
                {isSearching ? "" : "Search"}
              </button>
            </div>
            
            {searchResult && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={searchResult.user.profilePic || "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-icons.com%2Ficon%2Faccount-profile-user-avatar%2F219236&psig=AOvVaw3lCHkKLHFr4bu0rwgbtFto&ust=1753540569900000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIjrnPqd2I4DFQAAAAAdAAAAABAL"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{searchResult.user.fullName}</h3>
                      <p className="text-sm text-gray-500">@{searchResult.user.userCode}</p>
                    </div>
                  </div>
                  <div>
                    {searchResult.isAlreadyFriend ? (
                      <span className="badge badge-success">Already Friends</span>
                    ) : searchResult.hasExistingRequest ? (
                      <span className="badge badge-warning">Request Sent</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => sendFriendRequest(searchResult.user._id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Friend Requests Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <UserPlus className="w-5 h-5" />
              Friend Requests ({friendRequests.length})
            </h2>
            {isLoadingRequests ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : friendRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending friend requests</p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.from.profilePic || "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-icons.com%2Ficon%2Faccount-profile-user-avatar%2F219236&psig=AOvVaw3lCHkKLHFr4bu0rwgbtFto&ust=1753540569900000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIjrnPqd2I4DFQAAAAAdAAAAABAL"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{request.from.fullName}</h4>
                        <p className="text-sm text-gray-500">@{request.from.userCode}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => respondToFriendRequest(request._id, "accept")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => respondToFriendRequest(request._id, "reject")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Friends List Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <Users className="w-5 h-5" />
              My Friends ({friends.length})
            </h2>
            {isLoadingFriends ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No friends yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={friend.profilePic || "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-icons.com%2Ficon%2Faccount-profile-user-avatar%2F219236&psig=AOvVaw3lCHkKLHFr4bu0rwgbtFto&ust=1753540569900000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIjrnPqd2I4DFQAAAAAdAAAAABAL"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{friend.fullName}</h4>
                      <p className="text-sm text-gray-500">@{friend.userCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;