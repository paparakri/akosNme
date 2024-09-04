import React from 'react';
import { Box, Container, Grid, Avatar, Flex, Button, Text, Link, Icon } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';

interface ProfileProps {
  profilePicture: string;
  displayName: string;
  //description: string;
  //posts: number;
  //followers: number;
  //following: number;
}

function Profile({ profilePicture, displayName }: ProfileProps) {
  console.log(displayName);
  return (
    <Box as="section" py={{ base: 6, sm: 12 }}>
      <Container>
        <Grid justifyContent="center" mx="auto">
          <Box mt={{ base: -16, md: -20 }} textAlign="center">
            <Avatar src={profilePicture} size="2xl" shadow="xl" />
          </Box>
          <Grid templateColumns="1fr" justifyContent="center" py={6}>
            <Box maxW={{ base: "100%", sm: "md", md: "3xl" }} mx={{ base: "auto", sm: 6, md: 1 }}>
              <Flex justifyContent="space-between" alignItems="center" mb={1}>
                <Text fontSize="3xl" fontWeight="bold">{displayName}</Text>
                <Button variant="outline" colorScheme="blue" size="sm">
                  Follow
                </Button>
              </Flex>
              <Flex gap={3} mb={3}>
                <Box>
                  <Text as="span" fontWeight="bold">323 </Text>
                  <Text as="span" color="gray.500">Posts</Text>
                </Box>
                <Box>
                  <Text as="span" fontWeight="bold">3.5k </Text>
                  <Text as="span" color="gray.500">Followers</Text>
                </Box>
                <Box>
                  <Text as="span" fontWeight="bold">260 </Text>
                  <Text as="span" color="gray.500">Following</Text>
                </Box>
              </Flex>
              <Text color="gray.500" fontWeight="light">
                Decisions: If you can't decide, the answer is no. If two equally difficult
                paths, choose the one more painful in the short term (pain avoidance is creating an
                illusion of equality). Choose the path that leaves you more equanimous.
              </Text>
              <Link
                href="#"
                color="blue.500"
                mt={3}
                display="flex"
                alignItems="center"
                width="max-content"
                _hover={{ textDecoration: 'none' }}
              >
                More about me 
                <Icon as={ArrowForwardIcon} ml={1} transition="transform 0.2s" _hover={{ transform: 'translateX(3px)' }} />
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Profile;