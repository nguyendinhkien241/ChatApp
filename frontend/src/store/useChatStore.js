import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users : res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Fail to get users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages : res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Fail to get messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { messages, selectedUser } = get();
    try {
      // Always use JSON - backend will handle base64 data
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({messages:[...messages, res.data]});
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Fail to send message");
      throw error;
    }
  },

  subcribeToMessage: () => {
    const { selectedUser } = get();
    if(!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if(newMessage.SenderId !== selectedUser._id ) return;
      console.log(newMessage)
      set({
        messages: [...get().messages, newMessage],
      });
    })
  },

  unsubcribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage")
  },

  // Todo: Optimize this one later
  setSelectedUser: (selectedUser) => set({selectedUser}),
}))