"use client"
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Link, Switch } from "@chakra-ui/react";
import Subtitle from "../ui/subtitle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginNormalUser, loginClubUser } from "../lib/authHelper";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onLoginSubmit = async (e: { preventDefault: () => void; }) => {
    console.log("wazaaaap");
    
    e.preventDefault();
    
    const data = {
        email: formData.email,
        password: formData.password
    };
    try{
      await loginNormalUser(data);
    } catch (e: any){
      console.log(e);
    }
    try{
      await loginClubUser(data);
    } catch (e: any){
      console.error(e);
    }
    
    //router.push('/');
  }

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
        <FormControl as="form" onSubmit={onLoginSubmit}>
          <Heading mb={6} color={'white'}>Log In</Heading>
          <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="takis.tsi@gmail.com"
              color={'white'}
              type="email"
              variant="filled"
              bg={'gray.600'}
              mb={0}
              _hover={{bg: 'gray.800'}}
              _focus={{bg: 'gray.800'}}
          />
          <Subtitle> e-Mail </Subtitle>
          <Input
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="**********"
              color={'white'}
              type="password"
              variant="filled"
              bg={'gray.600'}
              mb={0}
              _hover={{bg: 'gray.800'}}
              _focus={{bg: 'gray.800'}}
          />
          <Subtitle> Password </Subtitle>
          <Box textAlign="center">
                <Button type="submit" w="20vw" colorScheme="teal" mb={8} mt={6}>
                    Log In
                </Button>
            </Box>
        </FormControl>
      </Flex>
    </Flex>
    </>
   ); 
}

export default Login;