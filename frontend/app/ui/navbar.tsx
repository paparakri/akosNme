"use client"

import {
  Box,
  Flex,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
} from '@chakra-ui/react';

import {
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import { getCurrentUser, useIsUserSignedIn } from '../lib/userStatus';
import { logout } from '../lib/authHelper';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserMenu } from './userMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
  role?: string;  // Add this to track user role
}

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS_NOT_LOGGED_IN: Array<NavItem> = [
  {
    label: 'Homepage',
    href: '/',
  },
  {
    label: 'Search',
    href: '/search'
  },
  {
    label: 'Explore Clubs',
    href: '/explore-clubs',
  },
  {
    label: 'Explore Events',
    href: '/explore-events',
  },
  {
    label: 'About Us',
    href: '/about-us',
  },
];

const NAV_ITEMS_LOGGED_IN: Array<NavItem> = [
  {
    label: 'Homepage',
    href: '/',
  },
  {
    label: 'Search',
    href: '/search'
  },
  {
    label: 'Explore Clubs',
    href: '/explore-clubs',
  },
  {
    label: 'Explore Events',
    href: '/explore-events',
  },
  {
    label: 'Social Feed',
    href: '/social-feed',
  },
  {
    label: 'About Us',
    href: '/about-us',
  }
];

export default function Navbar() {
  const [user, setUser] = useState<User>();
  const [scrolled, setScrolled] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isUserSignedIn = useIsUserSignedIn();
  
  const navItems = isUserSignedIn ? NAV_ITEMS_LOGGED_IN : NAV_ITEMS_NOT_LOGGED_IN;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(undefined);
      }
    };

    checkAuth();
    setMounted(true);
  }, [pathname]); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleButtonClick = (newPath: string) => {
    router.push(newPath);
  };

  const handleLogout = async () => {
    try {
      logout();
      setUser(undefined); // Clear user state immediately
      router.push('/'); // Redirect to home
      router.refresh(); // Force a refresh of the current route
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const MotionBox = motion(Box);
  const MotionFlex = motion(Flex);

  const DesktopNav = () => (
    <Stack direction="row" spacing={1}>
      {navItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  as="a"
                  px={3}
                  py={2}
                  href={navItem.href ?? '#'}
                  fontSize="sm"
                  fontWeight={500}
                  color="gray.200"
                  rounded="lg"
                  transition="all 0.2s"
                  _hover={{
                    textDecoration: 'none',
                    color: 'white',
                    bg: 'whiteAlpha.100',
                  }}
                  className="relative group"
                >
                  {navItem.label}
                </Box>
              </motion.div>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg="rgba(0, 0, 0, 0.95)"
                backdropFilter="blur(10px)"
                p={4}
                rounded="xl"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );

  const DesktopSubNav = ({ label, href, subLabel }: NavItem) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Box
        as="a"
        href={href}
        role="group"
        display="block"
        p={2}
        rounded="md"
        _hover={{ bg: 'whiteAlpha.100' }}
        className="transition-all duration-200"
      >
        <Stack direction="row" align="center">
          <Box>
            <Box
              color="white"
              fontWeight={500}
              _groupHover={{ color: 'blue.400' }}
              transition="all 0.2s"
            >
              {label}
            </Box>
            {subLabel && (
              <Box fontSize="sm" color="gray.400">
                {subLabel}
              </Box>
            )}
          </Box>
          <Flex
            transition="all .3s ease"
            transform="translateX(-10px)"
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify="flex-end"
            align="center"
            flex={1}
          >
            <Icon color="blue.400" w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Box>
    </motion.div>
  );

  const MobileNav = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Stack
          bg="rgba(0, 0, 0, 0.95)"
          backdropFilter="blur(10px)"
          p={4}
          display={{ md: 'none' }}
          mt={2}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          {navItems.map((navItem) => (
            <MobileNavItem key={navItem.label} {...navItem} />
          ))}
        </Stack>
      </motion.div>
    </AnimatePresence>
  );

  const MobileNavItem = ({ label, children, href }: NavItem) => {
    const { isOpen: isSubNavOpen, onToggle: onSubNavToggle } = useDisclosure();

    return (
      <Stack spacing={4} onClick={children && onSubNavToggle}>
        <motion.div
          whileTap={{ scale: 0.98 }}
        >
          <Flex
            py={2}
            as="a"
            href={href ?? '#'}
            justify="space-between"
            align="center"
            _hover={{
              textDecoration: 'none',
            }}
          >
            <Box
              color="white"
              fontWeight={600}
              _hover={{ color: 'blue.400' }}
              transition="all 0.2s"
            >
              {label}
            </Box>
            {children && (
              <Icon
                as={ChevronDown}
                transition="all .25s ease-in-out"
                transform={isSubNavOpen ? 'rotate(180deg)' : ''}
                w={6}
                h={6}
              />
            )}
          </Flex>
        </motion.div>

        <Collapse in={isSubNavOpen} animateOpacity>
          <Stack
            mt={2}
            pl={4}
            borderLeft={1}
            borderStyle="solid"
            borderColor="whiteAlpha.200"
            align="start"
          >
            {children &&
              children.map((child) => (
                <motion.div
                  key={child.label}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    py={2}
                    as="a"
                    href={child.href}
                    color="gray.400"
                    _hover={{ color: 'blue.400' }}
                    transition="all 0.2s"
                  >
                    {child.label}
                  </Box>
                </motion.div>
              ))}
          </Stack>
        </Collapse>
      </Stack>
    );
  };


  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <MotionBox
      position="fixed"
      top={4}
      left={0}
      right={0}
      mx="auto"
      zIndex={1000}
      width="90%"
      maxWidth="1200px"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <MotionFlex
        bg={scrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.5)'}
        color="white"
        minH="60px"
        py={2}
        px={6}
        alignItems="center"
        borderRadius="xl"
        backdropFilter="blur(10px)"
        boxShadow={scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none'}
        borderWidth="1px"
        borderColor={scrolled ? 'whiteAlpha.100' : 'transparent'}
        transition="all 0.3s ease"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </motion.button>
        </Flex>

        <MotionFlex 
          flex={{ base: 1 }} 
          justify={{ base: 'center', md: 'start' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Box className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              To Kone
            </Box>
          </motion.div>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </MotionFlex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          spacing={4}
          alignItems="center"
        >
          {!isUserSignedIn ? (
            <AnimatePresence>
              <Stack
                flex={{ base: 1, md: 0 }}
                justify="flex-end"
                direction="row"
                spacing={3}
                alignItems="center"
              >
                {/* Become a Partner Button with shimmer effect */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden lg:block relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 
                                rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 
                                group-hover:duration-200 animate-gradient-xy"></div>
                  <button
                    onClick={() => router.push('/partnership')}
                    className="relative flex items-center px-4 py-2 bg-black rounded-lg leading-none"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent 
                                  font-medium">
                        Partners
                      </span>
                    </span>
                  </button>
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium 
                          text-white/90 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  onClick={() => router.push('/sign-in')}
                >
                  Sign In
                </motion.button>

                {/* Get Started Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg 
                          bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                          transition-all duration-200 shadow-lg shadow-blue-500/25 
                          hover:shadow-blue-500/40"
                  onClick={() => router.push('/sign-up')}
                >
                  Get Started
                </motion.button>
              </Stack>
            </AnimatePresence>
          ) : (
            <UserMenu handleButtonClick={handleButtonClick} handleLogout={handleLogout} user={user} />
          )}
        </Stack>
      </MotionFlex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </MotionBox>
  );
}