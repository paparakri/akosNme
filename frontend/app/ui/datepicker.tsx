"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Grid,
  GridItem,
  Button,
  Text,
  HStack,
  Box,
  useOutsideClick,
} from '@chakra-ui/react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parse } from 'date-fns';

const ChakraDatePicker = ({
  name = 'date',
  value,
  onChange,
  isRequired = false,
  isInvalid = false,
  label = 'Date',
  errorMsg = '',
  bg='white'
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef();

  useOutsideClick({
    ref: calendarRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    if (value) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const parts = value.split('-');
      if (parts.length === 3) {
        setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
        setSelectedDate(new Date(value));
      }
    }
  }, [value]);

  const formatDateForInput = (inputValue:any) => {
    let cleaned = inputValue.replace(/[^\d]/g, '');
    
    if (cleaned.length >= 4) {
      cleaned = cleaned.slice(0, 8);
      const day = cleaned.slice(0, 2);
      const month = cleaned.slice(2, 4);
      const year = cleaned.slice(4);
      
      if (cleaned.length > 4) {
        return `${day}/${month}/${year}`;
      } else {
        return `${day}/${month}`;
      }
    } else if (cleaned.length >= 2) {
      const day = cleaned.slice(0, 2);
      const month = cleaned.slice(2);
      return `${day}/${month}`;
    }
    
    return cleaned;
  };

  const handleInputChange = (e:any) => {
    const inputValue = e.target.value;
    const formattedValue = formatDateForInput(inputValue);
    setDisplayValue(formattedValue);

    if (formattedValue.length === 10) {
      const [day, month, year] = formattedValue.split('/');
      
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getDate() === parseInt(day) &&
        dateObj.getMonth() === parseInt(month) - 1 &&
        dateObj.getFullYear() === parseInt(year)
      ) {
        setSelectedDate(dateObj);
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        onChange({
          target: {
            name,
            value: isoDate
          }
        });
      }
    }
  };

  const handleKeyDown = (e:any) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDateSelect = (date:any) => {
    setSelectedDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange({
      target: {
        name,
        value: formattedDate
      }
    });
    setDisplayValue(format(date, 'dd/MM/yyyy'));
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();

    return (
      <Box p={4} minW="280px" bg={bg}>
        <HStack justify="space-between" mb={4}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeftIcon size={16} />
          </Button>
          <Text fontWeight="bold">
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRightIcon size={16} />
          </Button>
        </HStack>

        <Grid templateColumns="repeat(7, 1fr)" gap={2}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <GridItem key={day} textAlign="center">
              <Text fontSize="sm" fontWeight="bold">{day}</Text>
            </GridItem>
          ))}

          {Array.from({ length: startDay }).map((_, index) => (
            <GridItem key={`empty-${index}`} />
          ))}

          {days.map(day => (
            <GridItem key={day.toString()}>
              <Button
                size="sm"
                variant="ghost"
                w="full"
                onClick={() => handleDateSelect(day)}
                bg={selectedDate && isSameDay(day, selectedDate) ? 'orange.500' : 'transparent'}
                color={selectedDate && isSameDay(day, selectedDate) ? 'white' : 'inherit'}
                _hover={{
                  bg: selectedDate && isSameDay(day, selectedDate) ? 'orange.600' : 'orange.100'
                }}
              >
                {format(day, 'd')}
              </Button>
            </GridItem>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={isInvalid}>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <Box position="relative">
            <Input
              value={displayValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              autoComplete="off"
              pr="2.5rem"
            />
            <Button
              position="absolute"
              right="0"
              top="50%"
              transform="translateY(-50%)"
              h="100%"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
            >
              <CalendarIcon size={16} />
            </Button>
          </Box>
        </PopoverTrigger>
        <PopoverContent 
          ref={calendarRef} 
          width="auto"
          style={{
            zIndex: 1400,  // Higher than default Chakra UI z-indices
            backgroundColor: 'white',
            position: 'relative'
          }}
        >
          <PopoverBody p={0}>
            {renderCalendar()}
          </PopoverBody>
        </PopoverContent>
      </Popover>
      {isInvalid && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
    </FormControl>
  );
};

export default ChakraDatePicker;