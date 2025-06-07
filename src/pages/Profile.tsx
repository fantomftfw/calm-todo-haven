
import React, { useState } from 'react';
import { LogOut, User, Mail, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, logout, updateUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await apiCall('/api/me', {
        method: 'PUT',
        body: { name, email },
        token
      });
      
      updateUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-blue-600" />
            )}
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
            Change Photo
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-800">
                {user?.name || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-800">
                {user?.email}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Edit size={20} className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
        
        <div className="space-y-3">
          <button className="w-full p-4 text-left text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors">
            🔔 Notifications
          </button>
          <button className="w-full p-4 text-left text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors">
            🎨 Appearance
          </button>
          <button className="w-full p-4 text-left text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors">
            ⚡ Focus Settings
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center"
      >
        <LogOut size={20} className="mr-2" />
        Logout
      </button>
    </div>
  );
};

export default Profile;
