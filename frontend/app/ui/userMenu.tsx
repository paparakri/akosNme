import React from "react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Avatar, Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text, useColorModeValue } from "@chakra-ui/react";
export const UserMenu = ({ handleButtonClick, handleLogout, user }: { handleButtonClick: (path: string) => void, handleLogout: () => void, user: any }) => {
  const userType = localStorage.getItem('userType');
  if (userType === 'normal') {
    return (
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
    );
  } else if(userType === 'club') {
    return(
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
            <MenuItem onClick={() => handleButtonClick(`/club/${user.username}`)}>
                <Text fontStyle="italic">
                Show Club Page
                </Text>
            </MenuItem>
            <Divider borderColor="gray.300" borderWidth="1px" my={1} />
            <MenuItem onClick={() => handleButtonClick('/club/dashboard')}>
                Club Dashboard
            </MenuItem>
            <Divider borderColor="gray.300" borderWidth="1px" my={1} />
            <MenuItem onClick={handleLogout}>
                <Text>
                Log out
                </Text>
            </MenuItem>
            </MenuList>
        </Menu>
    );
      
  }
}