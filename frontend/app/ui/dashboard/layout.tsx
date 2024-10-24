'use client';

import React, { use, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  IconButton,
  Icon,
  Text,
  useColorModeValue,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  ThemeConfig,
} from '@chakra-ui/react';
import { FiHome, FiTable, FiDollarSign, FiSettings, FiSearch, FiBell, FiUser } from 'react-icons/fi';

// Import your components here
import Dashboard from './dashboard';
import Profile from './profile';
import Events from './events';
import { DragDropSeatingCanvas } from '../dragDropSeating';
import { jwtDecode } from 'jwt-decode';
import { fetchClubByName } from '@/app/lib/backendAPI';
import SplashScreen from '../splashscreen';

interface ClubProps {
  _id: string,
  username: string,
  displayName: string,
  description: string,
  formattedPrice: number,
  reviewCount: number,
  rating: number,
  location: string,
  features: string[],
  reservations: { date: string; count: number }[],
  images: string[],
  address: string,
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  },
  genres: string[],
  minAge: number,
  capacity: number,
  dressCode: string,
  contactInfo: Object,
  socialMediaLinks: Object,
};

// Define reusable MenuItem component
const MenuItem = ({ icon, children, onClick, isActive } : {icon:any, children:any, onClick:any, isActive:any}) => {
  return (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      onClick={onClick}
      bg={isActive ? 'teal.700' : 'transparent'}
      color={isActive ? 'white' : 'inherit'}
      _hover={{
        bg: 'teal.700',
        color: 'white',
      }}
    >
      <Icon mr="4" fontSize="16" as={icon} />
      {children}
    </Flex>
  );
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const Layout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [clubData, setClubData] = useState<ClubProps>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if(token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if(decoded.username){
        console.log("Decoded username: " + decoded.username);
        fetchClubByName(decoded.username).then(data => {
            setClubData(data);
            setIsLoading(false);
            console.log(data);
        });
      }
    }
  }, []);



  const renderContent = () => {
    if (isLoading  && !clubData) {
      return <SplashScreen/>;
    }
    else if(clubData) {
      console.log("Rendering dashboard for club w/ club id: " + clubData._id);
      switch (activePage) {
        case 'dashboard':
          return <Dashboard />;
        case 'tables':
          return <DragDropSeatingCanvas id={clubData._id} />;
        case 'events':
          return <Events />;
        /*case 'settings':
          return <Settings />;*/
        case 'profile':
          return <Profile />;
        default:
          return <Dashboard />;
      }
    }
    
  };

  return (
    <Box minH="100vh">
      <Flex>
        {/* Sidebar */}
        <Box
          bg="gray.50"
          borderRight="1px"
          borderRightColor="gray.200"
          w={{ base: 'full', md: 60 }}
          pos="fixed"
          h="full"
        >
          <VStack align="stretch" mt="8" spacing="1">
            <Text
              fontSize="2xl"
              fontFamily="monospace"
              fontWeight="bold"
              textAlign="center"
              mb="8"
            >
              Club Dashboard
            </Text>
            <MenuItem 
              icon={FiHome} 
              onClick={() => setActivePage('dashboard')}
              isActive={activePage === 'dashboard'}
            >
              Dashboard
            </MenuItem>
            <MenuItem 
              icon={FiTable} 
              onClick={() => setActivePage('tables')}
              isActive={activePage === 'tables'}
            >
              Tables
            </MenuItem>
            <MenuItem 
              icon={FiDollarSign} 
              onClick={() => setActivePage('events')}
              isActive={activePage === 'events'}
            >
              Events
            </MenuItem>
            <MenuItem 
              icon={FiUser} 
              onClick={() => setActivePage('profile')}
              isActive={activePage === 'profile'}
            >
              Profile
            </MenuItem>
            <MenuItem 
              icon={FiSettings} 
              onClick={() => setActivePage('settings')}
              isActive={activePage === 'settings'}
            >
              Settings
            </MenuItem>
          </VStack>
        </Box>

        {/* Main content area */}
        <Box ml={{ base: 0, md: 60 }} p="4" w="full" bg={'white'}>

          {/* Page Content */}
          <Box mt="8">
            {renderContent()}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;