import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { LogOut, MessageSquare, Settings, User, Users, Bell } from 'lucide-react';

const Navbar = () => {
  const { logOut, authUser, unreadFriendRequests, loadFriendRequests, markFriendRequestsAsRead } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      loadFriendRequests();
    }
  }, [authUser, loadFriendRequests]);
  return (
    <header className='bg-base-100 border-b border-base-300
    fixed w-full top-0 z-40 backdrop-blur-lg hover:bg-base-100/80'>
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center gap-8'>
            <Link to="/" className='flex items-center gap-2.5 hover:opactiy-80
            transition-all'>
              <div className='size-9 rounded-lg bg-primary/10 flex items-center justify-center'>
                <MessageSquare className='size-5 text-primary'/>
              </div>
              <h1 className='text-lg font-bold'>Chatty</h1>
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            <Link to={"/settings"}
              className='btn btn-sm gap-2 transition-colors'
            >
              <Settings className='size-4' />
              <span className='hidden sm:inline'>Settings</span>
            </Link>
            {authUser && (
              <>
                <Link 
                  to={"/friends"} 
                  className={`btn btn-sm gap-2 relative`}
                  onClick={() => markFriendRequestsAsRead()}
                >
                  <Users className="size-5" />
                  <span className="hidden sm:inline">Friends</span>
                  {unreadFriendRequests > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadFriendRequests}
                    </div>
                  )}
                </Link>

                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logOut}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar