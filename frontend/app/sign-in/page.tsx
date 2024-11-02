"use client";

import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Link,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import Subtitle from "../ui/subtitle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginNormalUser, loginClubUser } from "../lib/authHelper";

const Login = () => {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name as keyof typeof errors]: "",
      }));
    }
  };

  const onLoginSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // First try normal user login
      const normalRes = await loginNormalUser(formData);
      
      if (typeof normalRes === 'object' && normalRes !== null && 'status' in normalRes && normalRes.status === 200) {
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/");
        return;
      }

      // If normal user login fails, try club user login
      const clubRes = await loginClubUser(formData);
      
      if (typeof clubRes === 'object' && clubRes !== null && 'status' in clubRes && clubRes.status === 200) {
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/");
        return;
      }

      // If both logins fail, show error message
      toast({
        title: "Login not successful",
        description: "Invalid email or password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Login not successful",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box as="nav" p={4} bg="gray.800">
        <Link href="/" as="a">
          <Button
            textColor="white"
            bg="gray.600"
            _hover={{ bg: "gray.500" }}
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
          >
            Back
          </Button>
        </Link>
      </Box>
      <Flex h="100vh" alignItems="center" justifyContent="center" bg="gray.800">
        <Flex
          flexDirection="column"
          bg="gray.700"
          p={12}
          borderRadius={8}
          boxShadow="lg"
          w="100%"
          maxW="400px"
        >
          <FormControl as="form" onSubmit={onLoginSubmit} isInvalid={errors.email || errors.password}>
            <Heading mb={6} color="white">
              Log In
            </Heading>

            <FormControl isInvalid={errors.email} mb={4}>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                color="white"
                type="email"
                variant="filled"
                bg="gray.600"
                _hover={{ bg: "gray.800" }}
                _focus={{ bg: "gray.800" }}
                isDisabled={isLoading}
                aria-label="Email"
              />
              <Subtitle>e-Mail</Subtitle>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password} mb={4}>
              <Input
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="**********"
                color="white"
                type="password"
                variant="filled"
                bg="gray.600"
                _hover={{ bg: "gray.800" }}
                _focus={{ bg: "gray.800" }}
                isDisabled={isLoading}
                aria-label="Password"
              />
              <Subtitle>Password</Subtitle>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Flex direction="column" align="center" mt={6}>
              <Button
                type="submit"
                w="100%"
                colorScheme="teal"
                mb={4}
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Log In
              </Button>
              <Link
                href="/forgot-password"
                color="teal.200"
                _hover={{ color: "teal.100" }}
                fontSize="sm"
              >
                Forgot password?
              </Link>
            </Flex>
          </FormControl>
        </Flex>
      </Flex>
    </>
  );
};

export default Login;