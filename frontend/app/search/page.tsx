"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import BarCard from '../ui/barCard';
import { fetchSearchResults } from '../lib/backendAPI';

const SearchResultsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockBars = [
    {
      _id: 1,
      displayName: 'The Underground', 
      description: 'Cool underground dance club',
      formattedPrice: 15,
      rating: 4.5,
      numReviews: 250,
      location: '123 Main St'
    },
    {
      _id: 2, 
      displayName: 'Sky Lounge',
      description: 'Rooftop bar with amazing views',
      formattedPrice: 20,  
      rating: 4,
      numReviews: 150,
      location: '456 High St' 
    },
    {
      _id: 2, 
      displayName: 'Sky Lounge',
      description: 'Rooftop bar with amazing views',
      formattedPrice: 20,  
      rating: 4,
      numReviews: 150,
      location: '456 High St' 
    },
    {
        _id: 2, 
        displayName: 'Sky Lounge',
        description: 'Rooftop bar with amazing views',
        formattedPrice: 20,  
        rating: 4,
        numReviews: 150,
        location: '456 High St' 
      },
      {
        _id: 2, 
        displayName: 'Sky Lounge',
        description: 'Rooftop bar with amazing views',
        formattedPrice: 20,  
        rating: 4,
        numReviews: 150,
        location: '456 High St' 
      },
      {
        _id: 2, 
        displayName: 'Sky Lounge',
        description: 'Rooftop bar with amazing views',
        formattedPrice: 20,  
        rating: 4,
        numReviews: 150,
        location: '456 High St' 
      },
      {
        _id: 2, 
        displayName: 'Sky Lounge',
        description: 'Rooftop bar with amazing views',
        formattedPrice: 20,  
        rating: 4,
        numReviews: 150,
        location: '456 High St' 
      },
    {
        _id: 3,
      displayName: 'Dive Bar',
      description: 'Low-key neighborhood hangout',
      formattedPrice: 5,
      rating: 3.5,  
      numReviews: 50,
      location: '789 Low Ave'
    }
  ]

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    const performSearch = async () => {
      try {
        setIsLoading(true);
        //const results = await fetchSearchResults(searchQuery);
        //setSearchResults(mockBars);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  console.log(searchResults);

  return (
    <Box p={8}>
      <Flex justifyContent="center" mb={8}>
        <InputGroup maxW="600px" w="100%">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search for clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Flex>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Text>Loading...</Text>
        </Box>
      ) : searchResults ? (
        <VStack spacing={8}>
          <Heading size="md">Search Results</Heading>
          <Flex
            justify="center"
            flexWrap="wrap"
            align="start"
            gridGap={6}
            width="100%"
          >
            {mockBars.map((result) => (
              <BarCard
                key={result._id}
                imageUrl=""
                imageAlt=""
                title={result.displayName}
                description={result.description}
                formattedPrice={result.formattedPrice}
                reviewCount={4}
                location={result.location}
                rating={result.rating}
              />
            ))}
          </Flex>
        </VStack>
      ) : (
        <Box textAlign="center" py={8}>
          <Heading size="md">No results found</Heading>
          <Text>Try a different search query.</Text>
        </Box>
      )}
    </Box>
  );
};

export default SearchResultsPage;