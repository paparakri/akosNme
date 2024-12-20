"use client"

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Flex,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
import { Search, UserPlus, UserMinus, Check, X, Mail, Users, Clock } from 'lucide-react';
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  switchUsername2Id,
} from '../../../lib/backendAPI';
import { getCurrentUser } from '../../../lib/userStatus';
import { AnimatePresence, motion } from 'framer-motion';

interface Friend {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  picturePath?: string;
}

interface FriendRequest {
  requestId: string;
  sender: Friend;
  receiver: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

interface FriendCardProps {
  friend: Friend;
  requestId?: string;
  onRemove: (requestId: string, action?: 'accept' | 'reject') => void;
  mode?: 'friend' | 'request';
}

const FriendCard = ({ friend, mode, requestId, onAction }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className="relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 
                   overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 
                      opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
              <img
                src={friend.picturePath || '/default-avatar.svg'}
                alt={friend.username}
                className="w-full h-full object-cover"
              />
            </div>
            {mode === 'friend' && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full 
                            border-2 border-black" />
            )}
          </div>
  
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{`${friend.firstName} ${friend.lastName}`}</h3>
            <p className="text-gray-400 text-sm">@{friend.username}</p>
          </div>
  
          <div className="flex gap-2">
            {mode === 'friend' ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction(friend._id)}
                className="p-2 rounded-full bg-red-500/10 text-red-500 
                         hover:bg-red-500 hover:text-white transition-all"
              >
                <UserMinus className="w-5 h-5" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAction(requestId, 'accept')}
                  className="p-2 rounded-full bg-green-500/10 text-green-500 
                           hover:bg-green-500 hover:text-white transition-all"
                >
                  <Check className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAction(requestId, 'reject')}
                  className="p-2 rounded-full bg-red-500/10 text-red-500 
                           hover:bg-red-500 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  
  const EmptyState = ({ icon, title, description }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center text-center 
                 bg-white/5 rounded-xl p-12 border border-white/10"
    >
      <div className="mb-4 opacity-50">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
  
  const AddFriendModal = ({ onClose, onSendRequest }) => {
    const [username, setUsername] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (username.trim()) {
        await onSendRequest(username);
        onClose();
      }
    };
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
        >
          <h2 className="text-2xl font-bold mb-4">Add New Friend</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                         focus:outline-none focus:border-purple-500"
                placeholder="Enter username..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                         rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Send Request
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 rounded-lg font-medium 
                         hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

interface AddFriendSectionProps {
  onSendRequest: (username: string) => Promise<void>;
}

const AddFriendSection: React.FC<AddFriendSectionProps> = ({ onSendRequest }) => {
  const [username, setUsername] = useState('');
  const inputBg = useColorModeValue('white', 'gray.800');

  const handleSendRequest = async () => {
    if (username.trim()) {
      await onSendRequest(username.trim());
      setUsername('');
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Add New Friend</Heading>
      <HStack>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            bg={inputBg}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendRequest();
              }
            }}
          />
        </InputGroup>
        <Button
          leftIcon={<UserPlus />}
          colorScheme="blue"
          onClick={handleSendRequest}
          isDisabled={!username.trim()}
        >
          Send Request
        </Button>
      </HStack>
    </VStack>
  );
};
const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');

  const refreshFriendsData = async (userId: string) => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(userId),
        getFriendRequests(userId),
      ]);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error refreshing friends data:', error);
      toast({
        title: 'Error refreshing friends',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.username) {
          const userId = await switchUsername2Id(user.username);
          setCurrentUserId(userId);
          await refreshFriendsData(userId);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        toast({
          title: 'Error loading friends',
          description: 'Please try again later',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [toast]);

  const handleSendRequest = async (username: string) => {
    if (!currentUserId) return;
    
    try {
      const targetId = await switchUsername2Id(username);
      await sendFriendRequest(currentUserId, targetId);
      await refreshFriendsData(currentUserId);
      toast({
        title: 'Friend request sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error sending friend request',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await removeFriend(currentUserId, friendId);
      await refreshFriendsData(currentUserId);
      toast({
        title: 'Friend removed',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error removing friend',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    if (!currentUserId) return;

    console.log("Request ID: ", requestId);

    try {
      if (action === 'accept') {
        await acceptFriendRequest(currentUserId, requestId);
      } else {
        await rejectFriendRequest(currentUserId, requestId);
      }
      await refreshFriendsData(currentUserId);
      toast({
        title: `Request ${action === 'accept' ? 'accepted' : 'declined'}`,
        status: action === 'accept' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error processing request',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }


  console.log("Friends Array: ", friends);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto pt-20"
      >
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
          
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Title and Stats */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Your Social Circle
                </h1>
                <div className="flex gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-purple-500/10 rounded-full"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400">{friends.length} Friends</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-blue-500/10 rounded-full"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400">{requests.length} Pending</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Search and Add Friend */}
              <div className="w-full md:w-auto space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search friends..."
                    className="w-full md:w-80 px-5 py-3 bg-white/5 border border-white/10 rounded-full 
                             focus:outline-none focus:border-purple-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddFriend(true)}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 
                           rounded-full font-medium flex items-center justify-center gap-2 
                           hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  Add New Friend
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-4">
              {['friends', 'requests'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium transition-all
                    ${activeTab === tab 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Friends/Requests Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeTab === 'friends' ? (
              friends.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-12 h-12 text-gray-500" />}
                  title="No Friends Yet"
                  description="Start building your social circle by adding some friends!"
                />
              ) : (
                friends.map((friend) => (
                  <FriendCard
                        key={friend._id}
                        friend={friend}
                        mode="friend"
                        onAction={handleRemoveFriend} requestId={undefined}                  />
                ))
              )
            ) : (
              requests.length === 0 ? (
                <EmptyState
                  icon={<Mail className="w-12 h-12 text-gray-500" />}
                  title="No Pending Requests"
                  description="You're all caught up! No pending friend requests."
                />
              ) : (
                requests.map((request) => (
                  <FriendCard
                    key={request.requestId}
                    friend={request.sender}
                    mode="request"
                    requestId={request.requestId}
                    onAction={handleRequestAction}
                  />
                ))
              )
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <AddFriendModal
            onClose={() => setShowAddFriend(false)}
            onSendRequest={handleSendRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsPage;