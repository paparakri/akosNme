"use client"
import { Button, Flex, Heading, Tabs, TabList, Tab, TabPanels, TabPanel, Box, Link } from "@chakra-ui/react";
import {NormalUserForm, ClubUserForm, ServiceProviderForm} from "./(forms)/userForms";
import { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";

const Login = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

   return(
    <>
    <Box as="nav" p={4} bg="gray.800">
      <Link href="/" as={'a'}>
        <Button textColor={'white'} bg={'gray.600'} _hover={{bg: "gray.500"}} leftIcon={<ArrowBackIcon />} variant="ghost">
          Back
        </Button>
      </Link>
    </Box>
    <Flex h="100vh" alignItems="center" justifyContent="center" bg={'gray.800'}>
      <Flex
        flexDirection="column"
        bg={'gray.700'}
        p={12}
        borderRadius={8}
        boxShadow="lg"
      >
        <Heading mb={6} color={'white'}>Sign Up</Heading>

        <Tabs onChange={(index) => setSelectedIndex(index)}>
          <TabList>
            <Tab textColor={'white'} _active={{color:'gray.400'}} _selected={{color:'gray.400'}}>
              Normal User
            </Tab>
            <Tab textColor={'white'} _active={{color:'gray.400'}} _selected={{color:'gray.400'}}>
              Club User
            </Tab>
            <Tab textColor={'white'} _active={{color:'gray.400'}} _selected={{color:'gray.400'}}>
              Service Provider
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <NormalUserForm/>
            </TabPanel>
            <TabPanel>
              <ClubUserForm/>
            </TabPanel>
            <TabPanel>
              <ServiceProviderForm/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Flex>
    </>
   ); 
}

export default Login;