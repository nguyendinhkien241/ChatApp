import React, { useState } from 'react'
import { Camera, Mail, User, Calendar, FileText, Users, Key } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || '',
    dateOfBirth: authUser?.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().split('T')[0] : '',
    bio: authUser?.bio || '',
    gender: authUser?.gender || ''
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      fullName: authUser?.fullName || '',
      dateOfBirth: authUser?.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().split('T')[0] : '',
      bio: authUser?.bio || '',
      gender: authUser?.gender || ''
    });
    setIsEditing(false);
  }

  return (
    <div className='h-screen pt-20'>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='mt-2'>Your profile information</p>
          </div>
          {/* avatar upload section*/}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary btn-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn btn-primary btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              <p className="text-xs text-zinc-500">Email cannot be changed</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="input input-bordered w-full"
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.dateOfBirth ? new Date(authUser.dateOfBirth).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gender
              </div>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="select select-bordered w-full"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.gender ? authUser.gender.charAt(0).toUpperCase() + authUser.gender.slice(1) : 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </div>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border min-h-[60px]">
                  {authUser?.bio || 'No bio added yet'}
                </p>
              )}
              {isEditing && (
                <p className="text-xs text-zinc-500">{formData.bio.length}/500 characters</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Security</span>
                <Link to="/change-password" className="text-primary hover:underline flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage