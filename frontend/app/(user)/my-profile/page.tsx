"use client"

import React, { useEffect, useState } from 'react';
import { Camera, Edit2, Mail, Phone, Calendar, MapPin, Award, Save, X } from 'lucide-react';
import { getCurrentUser } from '../../lib/userStatus';
import { fetchNormalUser, switchUsername2Id, updateNormalUser } from '../../lib/backendAPI';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bio: string;
  picturePath: string;
  loyaltyPoints: number;
}

const UserProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('No current user found');
      const userId = await switchUsername2Id(currentUser.username);
      const userData = await fetchNormalUser(userId);
      setUser(userData);
      setEditedUser(userData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
  </div>;

  const handleSave = async () => {
    try {
      if (!user?.username || !editedUser) return;
      const userId = await switchUsername2Id(user.username);
      const updatedUser = await updateNormalUser(userId, editedUser);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section with Parallax Effect */}
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/profilePage.jpeg")',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black" />
        </div>
        
        {/* Profile Information Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto flex items-end space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-blue-400 overflow-hidden">
                <img 
                  src={user.picturePath || '/default-avatar.svg'} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {`${user.firstName} ${user.lastName}`}
                </h1>
                <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 text-sm">
                  @{user.username}
                </span>
              </div>
              <p className="mt-2 text-gray-300 max-w-2xl">{user.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Card */}
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg border border-white/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Statistics</h3>
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-gray-400">Loyalty Points</div>
                  <div className="text-2xl font-bold text-blue-400">{user.loyaltyPoints}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-gray-400">Events Attended</div>
                  <div className="text-2xl font-bold text-purple-400">--(Doesn&apos;t Work)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-2 bg-white/5 rounded-2xl p-6 backdrop-blur-lg border border-white/10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white">{user.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-400/10">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Phone</div>
                  <div className="text-white">{user.phoneNumber}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Birthday</div>
                  <div className="text-white">{new Date(user.dateOfBirth).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-400/10">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Location</div>
                  <div className="text-white">Athens, Greece</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;