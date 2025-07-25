import React, { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ChangePasswordPage = () => {
  const { changePassword, isChangingPassword } = useAuthStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }
    
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      toast.success('Password changed successfully!')
      navigate('/profile')
    } catch (error) {
      // Error handling is done in the store
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className='h-screen pt-20'>
      <div className='max-w-md mx-auto p-4 py-8'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>
          <div className='text-center'>
            <Link to="/profile" className='inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 mb-4'>
              <ArrowLeft className='w-4 h-4' />
              Back to Profile
            </Link>
            <h1 className='text-2xl font-semibold'>Change Password</h1>
            <p className='mt-2 text-zinc-400'>Update your account password</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Current Password */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-400 flex items-center gap-2'>
                <Lock className='w-4 h-4' />
                Current Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className='input input-bordered w-full pr-10'
                  placeholder='Enter your current password'
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('current')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300'
                >
                  {showPasswords.current ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-400 flex items-center gap-2'>
                <Lock className='w-4 h-4' />
                New Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className='input input-bordered w-full pr-10'
                  placeholder='Enter your new password'
                  required
                  minLength={6}
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('new')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300'
                >
                  {showPasswords.new ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              <p className='text-xs text-zinc-500'>Password must be at least 6 characters long</p>
            </div>

            {/* Confirm New Password */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-400 flex items-center gap-2'>
                <Lock className='w-4 h-4' />
                Confirm New Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className='input input-bordered w-full pr-10'
                  placeholder='Confirm your new password'
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('confirm')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300'
                >
                  {showPasswords.confirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='btn btn-primary w-full'
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className='bg-base-200 rounded-lg p-4'>
            <h3 className='font-medium mb-2'>Password Requirements:</h3>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>• At least 6 characters long</li>
              <li>• Different from your current password</li>
              <li>• Keep it secure and don't share it</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage