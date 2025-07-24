import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageSkeleton from './skeleton/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subcribeToMessage, unsubcribeFromMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    getMessages(selectedUser._id);
    subcribeToMessage()
    return () => unsubcribeFromMessage();
  }, [selectedUser._id, getMessages, subcribeToMessage, unsubcribeFromMessage]);

  console.log(messages);

  useEffect(() => {
    if(messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

  if(isMessagesLoading) return (
    <div className='flex flex-1 flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <ChatInput />
    </div>
  )

  return (
    <div className='flex flex-1 flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.SenderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img 
                  src={message.SenderId == authUser._id
                  ? authUser.profilePic || "https://tse3.mm.bing.net/th/id/OIP.dxLact-AwiLljWcE6sQcuwHaHa?r=0&w=3873&h=3873&rs=1&pid=ImgDetMain&o=7&rm=3"
                  : selectedUser.profilePic || "https://tse3.mm.bing.net/th/id/OIP.dxLact-AwiLljWcE6sQcuwHaHa?r=0&w=3873&h=3873&rs=1&pid=ImgDetMain&o=7&rm=3"} 
                  alt="profile pic" 
                />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <ChatInput />
    </div>
  )
}

export default ChatContainer