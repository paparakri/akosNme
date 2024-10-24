"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Switch,
  Select,
  useColorModeValue,
  Container,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from 'lucide-react';
import { HamburgerIcon } from '@chakra-ui/icons';
import HourInput from '@/app/ui/hourInput';
import { SettingsType } from './settingsTypes';
import { fetchUserSettings, switchUsername2Id, updateNormalUser } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';

const initialSettings: SettingsType = {
  notifications: {
      email: true,
      push: false,
      choice: {
          clubToggle: true,
          friendToggle: false,
          artistToggle: true,
          timeBefore: 30, // Example: 30 minutes before
          timeToggle: true,
      },
  },
  security: {
      twoFactor: false,
  },
  privacy: {
      shareData: true,
      publicProfile: false,
      shareLocation: true,
      shareEmail: false,
      sharePhone: false,
      shareReservations: true,
  },
  themeAccessibility: {
      theme: 'light', // Options: light, dark, system
      accessibility: 'normal', // Options: normal, high, extreme
  },
};

const MenuItem = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <Text py={2} px={4} cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={onClick}>
    {children}
  </Text>
);

const DropMenuItem = ({ children }: { children: React.ReactNode}) => (
  <Text py={2} px={4} cursor="pointer" _hover={{ bg: 'gray.100' }}>
    {children}
  </Text>
);


const MenuSubItem = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <Text fontSize={14} ml={4} py={2} px={4} cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={onClick}>
    {children}
  </Text>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading size="md" mb={4}>
    {children}
  </Heading>
);

const SettingItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Flex justify="space-between" align="center" mb={2}>
    <Text>{label}</Text>
    {children}
  </Flex>
);

const SettingDropdown = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) => (
  <Flex justify={'space-between'} mb={2}>
    <Text>{label}</Text>
    <Select width={'auto'} value={value} onChange={(e) => onChange(e.target.value)} size="sm">
      {options.map((option) => (<option key={option}>{option}</option>))}
    </Select>
  </Flex>
)

const SettingButton = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <Button
      size={'sm'}
      colorScheme="blue"
      variant="outline"
      onClick={onClick}
      width="fit-content" // Make the button as big as its content
      mt={2} // Add some margin on top
    >
        <Text>{label}</Text>
    </Button>
  );
};

const AccountSettingsPage = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [settings, setSettings] = useState<SettingsType | null>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const toast = useToast();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const accountInfoRef = useRef<HTMLDivElement>(null);
  const reservationHistoryRef = useRef<HTMLDivElement>(null);
  const themeAccessibilityRef = useRef<HTMLDivElement>(null);
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.username) {
          const id = await switchUsername2Id(user.username);
          setUserId(id);
          const fetchedSettings = await fetchUserSettings(id);
          setSettings(fetchedSettings || initialSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error fetching settings",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSettingChange = (path: string[], value: any) => {
    setSettings((prevSettings) => {
      if (!prevSettings) return null;

      const newSettings = JSON.parse(JSON.stringify(prevSettings));
      let current = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]] === undefined) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveChanges = async () => {
    if (userId && settings) {
      try {
        await updateNormalUser(userId, {accountSettings: settings});
        toast({
          title: "Settings saved",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error saving settings:", error);
        toast({
          title: "Error saving settings",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Flex minH="100vh" bg={bgColor} my={8} boxShadow={'lg'} borderRadius={50} p={8}>
      {/* Sidebar */}
      <Box w="10vw" borderRight="1px" borderColor="gray.200">
        <VStack align="stretch" spacing={0} mt={4} position={'fixed'}>
          <Box p={4}><Heading size="lg">TuneSync</Heading></Box>
          <MenuItem onClick={() => scrollToSection(notificationsRef)}>Notifications</MenuItem>
          <MenuItem onClick={() => scrollToSection(securityRef)}>Security</MenuItem>
          <MenuItem onClick={() => scrollToSection(privacyRef)}>Privacy</MenuItem>
          <MenuSubItem onClick={() => scrollToSection(privacyRef)}>Visible Info</MenuSubItem>
          <MenuItem onClick={() => scrollToSection(reservationHistoryRef)}>Change Account Info</MenuItem>
          <MenuItem onClick={() => scrollToSection(reservationHistoryRef)}>Reservation History</MenuItem>
          <MenuItem onClick={() => scrollToSection(themeAccessibilityRef)}>Theme & Accessibility</MenuItem>
        </VStack>
      </Box>

      {/* Main content */}
      <Box flex={1} overflowY="auto" w={'50vw'} ref={notificationsRef}>
        <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <ChevronLeftIcon width={6} height={6} />
              <Heading size="lg" ml={2}>Account Settings</Heading>
            </Flex>
            <Button colorScheme="blue" onClick={handleSaveChanges}>Save Changes</Button>
          </Flex>
        </Box>

        <Container maxW="container.md" py={8}>
          <VStack spacing={8} align="stretch">

            <Box ref={securityRef}>
              <SectionHeading>Notifications</SectionHeading>
              <SettingItem label="Email Notifications">
                <Switch
                  isChecked={settings?.notifications.email}
                  onChange={(e) => handleSettingChange(['notifications', 'email'], e.target.checked)}
                />
              </SettingItem>
              <SettingItem label="Push Notifications">
                <Switch
                  isChecked={settings?.notifications.push}
                  onChange={(e) => handleSettingChange(['notifications', 'push'], e.target.checked)}
                />
              </SettingItem>
              <Menu>
                <MenuButton 
                  as={Button}
                  verticalAlign={'center'}
                  variant='ghost'
                  px={2}
                  py={1}
                >
                  <HStack>
                    <Text>Choose when to receive notifications </Text>
                    <HamburgerIcon m={2} />
                  </HStack>
                </MenuButton>
                <MenuList>
                  <DropMenuItem>
                    <HStack width="100%" justify="space-between">
                      <Text>Followed Club is hosting a special event: </Text>
                      <Switch
                        isChecked={settings?.notifications.choice.clubToggle}
                        onChange={(e) => handleSettingChange(['notifications', 'choice', 'clubToggle'], e.target.checked)}
                      />
                    </HStack>
                  </DropMenuItem>
                  <DropMenuItem>
                    <HStack width="100%" justify="space-between">
                      <Text>Friend is going to a special event: </Text>
                      <Switch
                        isChecked={settings?.notifications.choice.friendToggle}
                        onChange={(e) => handleSettingChange(['notifications', 'choice', 'friendToggle'], e.target.checked)}
                      />
                    </HStack>
                  </DropMenuItem>
                  <DropMenuItem>
                    <HStack width="100%" justify="space-between">
                      <Text>Followed Artist is hosting a special event: </Text>
                      <Switch
                        isChecked={settings?.notifications.choice.artistToggle}
                        onChange={(e) => handleSettingChange(['notifications', 'choice', 'artistToggle'], e.target.checked)}
                      />
                    </HStack>
                  </DropMenuItem>
                  <DropMenuItem>
                    <HStack>
                      <HourInput
                        value={settings?.notifications.choice.timeBefore ?? 0}
                        onChange={(value) => handleSettingChange(['notifications', 'choice', 'timeBefore'], value)}
                        afterLabel=' before a reservation: '
                      />
                      <Switch
                        isChecked={settings?.notifications.choice.timeToggle}
                        onChange={(e) => handleSettingChange(['notifications', 'choice', 'timeToggle'], e.target.checked)}
                      />
                    </HStack>
                  </DropMenuItem>
                </MenuList>
              </Menu>
            </Box>

            <Divider />

            <Box ref={privacyRef}>
              <SectionHeading>Security</SectionHeading>
              <VStack spacing={4} align="stretch">
                <SettingButton label='Change your Password' onClick={() => {}}/>
                <SettingItem label="Two-Factor Authentication">
                  <Switch
                    isChecked={settings?.security.twoFactor}
                    onChange={(e) => handleSettingChange(['security', 'twoFactor'], e.target.checked)}
                  />
                </SettingItem>
              </VStack>
            </Box>

            <Divider />

            <Box ref={accountInfoRef}>
            <VStack spacing={0} align="stretch">
                <SectionHeading>Privacy</SectionHeading>
                    <SettingItem label='Share Usage Data'>
                        <Switch
                            isChecked={settings?.privacy.shareData}
                            onChange={(e) => handleSettingChange(['privacy', 'shareData'], e.target.checked)}
                        />
                    </SettingItem>
                    <SettingItem label="Public Profile">
                        <Switch
                            isChecked={settings?.privacy.publicProfile}
                            onChange={(e) => handleSettingChange(['privacy', 'publicProfile'], e.target.checked)}
                        />
                    </SettingItem>
                </VStack>
                <Heading size={'sm'} mb={2}>Information Visible on Profile</Heading>
                <VStack spacing={0} align={'stretch'} ml={3}>
                    <SettingItem label="Share e-Mail">
                        <Switch
                            isChecked={settings?.privacy.shareEmail}
                            onChange={(e) => handleSettingChange(['privacy', 'shareEmail'], e.target.checked)}
                        />
                    </SettingItem>
                    <SettingItem label="Share Location">
                        <Switch
                            isChecked={settings?.privacy.shareLocation}
                            onChange={(e) => handleSettingChange(['privacy', 'shareLocation'], e.target.checked)}
                        />
                    </SettingItem>
                    <SettingItem label="Share Phone Number">
                        <Switch
                            isChecked={settings?.privacy.sharePhone}
                            onChange={(e) => handleSettingChange(['privacy', 'sharePhone'], e.target.checked)}
                        />
                    </SettingItem>
                    <SettingItem label="Share Reservations">
                        <Switch
                            isChecked={settings?.privacy.shareReservations}
                            onChange={(e) => handleSettingChange(['privacy', 'shareReservations'], e.target.checked)}
                        />
                    </SettingItem>
                </VStack>
            </Box>

            <Divider />

            <Box ref={reservationHistoryRef}>
                <SectionHeading>Change Vital Account Info</SectionHeading>
                <Flex direction={'column'}>
                    <SettingButton label='Change your e-Mail' onClick={() => {}}/>
                    <SettingButton label='Change your Phone Number' onClick={() => {}}/>
                    <SettingButton label='Change your Username' onClick={() => {}}/>
                </Flex>
            </Box>

            <Divider />

            <Box ref={themeAccessibilityRef}>
                <SectionHeading>Reservation History</SectionHeading>
                {/* Load Reservation History List */}
            </Box>

            <Divider />

            <Box ref={themeAccessibilityRef}>
                <SectionHeading>Theme & Accesibility</SectionHeading>
                <SettingDropdown
                    label='Theme'
                    options={['light', 'dark', 'system']}
                    value={settings?.themeAccessibility.theme ?? ''}
                    onChange={(value) => handleSettingChange(['themeAccessibility', 'theme'], value)}
                />
                <SettingDropdown
                    label='Accessibility'
                    options={['normal', 'high', 'extreme']}
                    value={settings?.themeAccessibility.accessibility ?? ''}
                    onChange={(value) => handleSettingChange(['themeAccessibility', 'accessibility'], value)}
                />
            </Box>

            {/* Additional sections can be added here as needed */}

          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};

export default AccountSettingsPage;
