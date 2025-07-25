import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
  authUser:null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isChangingPassword: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  friendRequests: [],
  unreadFriendRequests: 0,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data});
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async(data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post('/auth/register', data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logOut: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disConnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log out");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/updateProfile', data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async (data) => {
    set({ isChangingPassword: true });
    try {
      await axiosInstance.put('/auth/changePassword', data);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      throw error;
    } finally {
      set({ isChangingPassword: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if(!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      }
    });
    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds})
    });

    socket.on("newFriendRequest", (data) => {
      set((state) => ({
        friendRequests: [...state.friendRequests, data.request],
        unreadFriendRequests: state.unreadFriendRequests + 1
      }));
      toast.success(`${data.request.from.fullName} sent you a friend request!`);
    });

    socket.on("friendRequestResponse", (data) => {
      const { action, request } = data;
      if (action === "accept") {
        toast.success(`${request.to.fullName} accepted your friend request!`);
      } else {
        toast.info(`${request.to.fullName} declined your friend request`);
      }
    });
  },

  disConnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.off("getOnlineUsers");
      socket.off("newFriendRequest");
      socket.off("friendRequestResponse");
      socket.disconnect();
      set({ socket: null });
    }
  },

  loadFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ 
        friendRequests: res.data,
        unreadFriendRequests: res.data.length
      });
    } catch (error) {
      console.log("Error loading friend requests", error);
    }
  },

  markFriendRequestsAsRead: () => {
    set({ unreadFriendRequests: 0 });
  },

}))