import React from 'react'
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import NochatSelected from '../components/NochatSelected';
import ChatContainer from '../components/ChatContainer';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className='h-screen bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar />
            {!selectedUser ? <NochatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage