"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, DollarSign, Edit, Trash2, 
  Plus, PartyPopper, Sparkles, Info 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEvent, getClubEvents } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import AddEvent from './addEvent';

const MyEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
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
    if (currentUser?._id) {
      fetchEvents();
    }
  }, [refreshTrigger, currentUser]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      setError(null);
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }
      
      await deleteEvent(currentUser._id, eventId);
      setDeleteConfirm(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 opacity-75" />
          <div className="absolute inset-0 rounded-full border-r-2 border-l-2 border-purple-500 opacity-75 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-lg p-6 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-red-500/5" />
          <div className="relative flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Info className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-700">
              {error}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if(creatingEvent) {
    return <AddEvent setCreatingEvent={handleEventCreated} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
          <h1 className="text-2xl font-bold text-purple-400">
              My Events
            </h1>
            <p className="text-gray-400">Manage your upcoming events and create new experiences</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreatingEvent(true)}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transition-opacity duration-300 opacity-0 group-hover:opacity-20" />
            <div className="relative flex items-center space-x-2 text-white">
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </div>
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {events?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="relative p-12 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                >
                  <PartyPopper className="w-10 h-10 text-blue-400" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-4">No events yet</h3>
                <p className="text-gray-400 mb-8">Start creating amazing experiences for your guests</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCreatingEvent(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl
                           shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Event
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {events?.map((event) => (
                <motion.div
                  key={event._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setHoveredCard(event._id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative"
                >
                  {/* Card glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 blur transition duration-500" />
                  
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    {event.images && event.images[0] ? (
                      <div className="relative h-48">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                        <img
                          src={event.images[0]}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-5 h-5 mr-3 text-purple-400" />
                          <span className="text-sm">{new Date(event.startTime).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Users className="w-5 h-5 mr-3 text-green-400" />
                          <span className="text-sm">{event.availableTickets} tickets available</span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <DollarSign className="w-5 h-5 mr-3 text-yellow-400" />
                          <span className="text-sm">${parseFloat(event.price).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/events/edit/${event._id}`)}
                          className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg
                                   hover:bg-white/20 transition-colors duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(event._id)}
                          className="flex items-center px-4 py-2 bg-red-500/10 backdrop-blur-sm text-red-400 rounded-lg
                                   hover:bg-red-500/20 transition-colors duration-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-sm w-full overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20" />
                
                <div className="relative p-6 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                      <Info className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
                      <p className="text-gray-400 mt-1">This action cannot be undone</p>
                      </div>
                  </div>

                  <p className="text-gray-300">
                    Are you sure you want to delete this event? All associated data will be permanently removed.
                  </p>

                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(null)}
                      className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 
                               transition-colors duration-300 backdrop-blur-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(deleteConfirm)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg
                               shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                    >
                      Delete Event
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyEvents;