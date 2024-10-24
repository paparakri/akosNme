"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEvent, getClubEvents } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import AddEvent from './addEvent';

const MyEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);  // Add user state

  useEffect(() => {
    // Get user data first
    const initializeUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setError('Failed to fetch user data');
        setIsLoading(false);
      }
    };
    
    initializeUser();
  }, []);

  useEffect(() => {
    // Only fetch events if we have a user
    if (currentUser?._id) {
      fetchEvents();
    }
  }, [refreshTrigger, currentUser]); // Depend on both refreshTrigger and currentUser

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);  // Reset error state
      const response = await getClubEvents(currentUser._id);
      setEvents(response);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = () => {
    setCreatingEvent(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (eventId) => {
    try {
      setError(null);  // Reset error state
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }
      
      await deleteEvent(currentUser._id, eventId);  // Wait for deletion to complete
      setDeleteConfirm(null);
      setRefreshTrigger(prev => prev + 1);  // Only trigger refresh after successful deletion
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(creatingEvent) {
    return <AddEvent setCreatingEvent={handleEventCreated} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <button
          onClick={() => setCreatingEvent(true)}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {events?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">No events found</h3>
            <p className="text-gray-500 mb-6">You haven't created any events yet.</p>
            <button
              onClick={() => router.push('/events/create')}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* TODO: Implement your image loading strategy here */}
              {event.images && event.images[0] && (
                <div className="relative h-48 w-full">
                  <img
                    src={event.images[0]} // Replace with your image URL structure
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm">{new Date(event.startTime).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="text-sm">{event.availableTickets} tickets available</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="text-sm">${parseFloat(event.price).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => router.push(`/events/edit/${event._id}`)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => setDeleteConfirm(event._id)}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;