"use client";

import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Divider,
} from '@chakra-ui/react';

import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

import { getCurrentUser, useIsUserSignedIn } from '../lib/userStatus';
import { logout } from '../lib/authHelper';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  const isUserSignedIn = useIsUserSignedIn();

  const handleButtonClick = (newPath:string) => {
    router.push(newPath);
  }


  const handleLogout = async () => {
    await logout();
    location.reload();
  };

  return (
    <Box
      position="fixed"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      width="90%"
      maxWidth="1200px"
    >
      <Flex
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'50px'}
        py={2}
        px={4}
        alignItems={'center'}
        borderRadius="15"
        backdropFilter="blur(5px)"
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            Logo
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          alignItems={'center'}
        >            
          {!isUserSignedIn ? (
            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}>
              <Button as={'a'} fontSize={'sm'} fontWeight={400} variant={'link'} href={'/sign-in'}>
                Sign In
              </Button>
              <Button
                as={'a'}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'orange.400'}
                href={'/sign-up'}
                _hover={{
                  bg: 'orange.300',
                }}>
                Sign Up
              </Button>
            </Stack>
          ) : (
            <Menu placement='bottom-end'>
              <MenuButton
                as={Button}
                verticalAlign={'center'}
                variant='ghost'
                display='flex'
                alignItems='end'
                shadow={'xl'}
                px={2}
                py={1}
                borderWidth={1}
                borderRadius='full'
              >
                <HamburgerIcon m={2} />
                <Avatar size='sm' name={user?.username || 'User'} src={user?.avatar} />
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.800')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <MenuItem onClick={() => handleButtonClick('/my-profile')}>
                  <Text fontStyle="italic">
                    Show Profile
                  </Text>
                </MenuItem>
                <Divider borderColor="gray.300" borderWidth="1px" my={1} />
                <MenuItem onClick={() => handleButtonClick('/my-profile/bookings')}>
                  Bookings
                </MenuItem>
                <MenuItem>
                  Messages
                </MenuItem>
                <MenuItem>
                  Favorite Clubs
                </MenuItem>
                <Divider borderColor="gray.300" borderWidth="1px" my={1} />
                <MenuItem onClick={() => handleButtonClick('my-profile/account-settings')}>
                  Account Settings
                </MenuItem>
                <Divider borderColor="gray.300" borderWidth="1px" my={1} />
                <MenuItem onClick={handleLogout}>
                  <Text>
                    Log out
                  </Text>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Stack>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}>
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
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as="a"
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'pink.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as="a"
        href={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}>
        <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Box as="a" key={child.label} py={2} href={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}


// { label: "...," children: [...], href: "...", subLabel: "..."}
const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Homepage',
    href: '/'
  },
  {
    label: 'Search',
    href: '#'
  },
  {
    label: 'Events',
    href: '#'
  },
  {
    label: 'Following Feed',
    href: '#'
  }
]
