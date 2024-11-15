import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  useColorModeValue,
  Input,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

interface OpeningHoursPickerProps {
  value: OpeningHours;
  onChange: (newValue: OpeningHours) => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultDayValue = {
  isOpen: false,
  open: '09:00',
  close: '17:00',
};

export const OpeningHoursPicker: React.FC<OpeningHoursPickerProps> = ({ value, onChange }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleDayChange = (day: string, field: 'isOpen' | 'open' | 'close', newValue: boolean | string) => {
    const updatedHours = {
      ...value,
      [day]: {
        ...(value[day] || defaultDayValue),
        [field]: newValue,
      },
    };
    onChange(updatedHours);
  };

  useEffect(() => {
    const formattedTimes = daysOfWeek.map(day => {
      const dayValue = value[day] || defaultDayValue;
      return `${day}: ${dayValue.open} - ${dayValue.close}`;
    }).join('\n');
    console.log(formattedTimes);
  }, [value]);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        {daysOfWeek.map((day) => {
          const dayValue = value[day] || defaultDayValue;
          return (
            <HStack key={day} justify="space-between">
              <Text fontWeight="medium" width="100px">{day.slice(0,3)}</Text>
              <Switch
                isChecked={dayValue.isOpen}
                onChange={(e) => handleDayChange(day, 'isOpen', e.target.checked)}
                colorScheme="blue"
              />
              <Input
                type='time'
                value={dayValue.open}
                onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                isDisabled={!dayValue.isOpen}
              />
              -
              <Input
                type='time'
                value={dayValue.close}
                onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                isDisabled={!dayValue.isOpen}
              />
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};

export const OpeningHoursInfo = ({ label, value }: { label: string; value: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [today, setToday] = useState('');
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const valueArray = value.split('\n');

  useEffect(() => {
    const currentDay = new Date().getDay();
    setToday(daysOfWeek[currentDay]);
  }, []);

  const todaySchedule = valueArray.find((day: string) => day.startsWith(today));

  return (
    <Box>
      <HStack 
        justifyContent="space-between" 
        w="full" 
        cursor="pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text fontWeight="bold">{label}:</Text>
        <HStack>
          {!isExpanded ? <Text>{todaySchedule || `${today}: Closed`}</Text> : <></>}
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HStack>
      </HStack>
      {isExpanded && (
        <VStack align="stretch" mt={2} pl={4} gap={0}>
          {valueArray.map((day: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => {
            if (typeof day === 'string') {
              return (
                <Text textAlign={'right'} key={index} color={day.startsWith(today) ? 'blue.500' : 'inherit'}>
                  {day}
                </Text>
              );
            }
            return null;
          })}
        </VStack>
      )}
    </Box>
  );
};

type ClubFormData = {
  _id: string,
  username: string;
  email: string;
  displayName: string;
  description: string;
  location: string;
  capacity: number | string;
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  features: string[];
  genres: string[];
  minAge: number | string;
  dressCode: string;
  contactInfo: ContactInfo;
  socialMediaLinks: SocialMediaLinks;
  images: FileList | null;
  password: string;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type SocialMediaLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
};

export const openingHoursToString = (openingHours: ClubFormData['openingHours']) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formattedHours = daysOfWeek.map(day => {
    const dayHours = openingHours[day];
    if (!dayHours || !dayHours.isOpen) {
      return `${day.slice(0, 3)}: Closed`;
    } else if (dayHours.open && dayHours.close) {
      return `${day.slice(0, 3)}: ${dayHours.open} - ${dayHours.close}`;
    } else {
      return `${day.slice(0, 3)}: Not specified`;
    }
  });

  return formattedHours.join('\n');
};