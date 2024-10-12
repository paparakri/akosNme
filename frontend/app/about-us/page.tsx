import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  List,
  ListItem
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

const CheckIcon = () => <FaCheckCircle color="green.500" />; // Create a wrapper component

const AboutUsPage = () => {
  return (
    <Box p={8}>
      <Flex direction={{ base: 'column', md: 'row' }} align="center" mb={8}>
        <Box flex="1" pr={{ base: 0, md: 8 }}>
          <Heading mb={4} color='orange.300'>About Our Platform</Heading>
          <Text mb={6}>
            We're a team of nightlife enthusiasts who created this platform to
            make the process of reserving tables at clubs in Greece a breeze.
            Our mission is to connect club owners with customers and provide a
            seamless booking experience for everyone.
          </Text>
          <List spacing={4}>
            <ListItem>
            <Flex align={'center'}>
              <CheckIcon/>
              Explore a curated selection of the best clubs in Greece
            </Flex>
            </ListItem>
            <ListItem>
            <Flex align={'center'}>
              <CheckIcon/>
              Easily reserve tables with real-time availability
            </Flex>
            </ListItem>
            <ListItem>
            <Flex align={'center'}>
              <CheckIcon/>
                Discover exclusive VIP and premium experiences
            </Flex>
            </ListItem>
          </List>
        </Box>
        <Box flex="1" mt={{ base: 8, md: 0 }}>
          <Image
            src="/assets/images/about-us.jpg"
            //alt="About Us"
            borderRadius="md"
            boxShadow="xl"
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default AboutUsPage;