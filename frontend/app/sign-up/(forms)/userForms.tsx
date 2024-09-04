"use client"
import Subtitle from "@/app/ui/subtitle";
import { Box, Button, Flex, FormControl, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { signInClubUser, signInNormalUser } from "@/app/lib/authHelper";

export function NormalUserForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confPassword: ""
    });
    const router = useRouter();

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onNormalUserSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (formData.password !== formData.confPassword) {
            alert("Passwords don't match!");
            return;
        }
        const data = {
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
        };
        await signInNormalUser(data);
        router.push('/');
    };

    return (
        <FormControl as="form" onSubmit={onNormalUserSubmit}>
            <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                mt={5}
                placeholder="Takis"
                color={'white'}
                type="text"
                variant="filled"
                bg={'gray.600'}
                mb={0}
                _hover={{bg: 'gray.800'}}
                _focus={{bg: 'gray.800'}}
            />
            <Subtitle> First Name </Subtitle>
            <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Tsimpoukakis"
                color={'white'}
                type="text"
                variant="filled"
                bg={'gray.600'}
                mb={0}
                _hover={{bg: 'gray.800'}}
                _focus={{bg: 'gray.800'}}
            />
            <Subtitle> Last Name </Subtitle>
            <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="takTheTsimpouk"
                color={'white'}
                type="text"
                variant="filled"
                bg={'gray.600'}
                mb={0}
                _hover={{bg: 'gray.800'}}
                _focus={{bg: 'gray.800'}}
            />
            <Subtitle> Username </Subtitle>
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
            <Input
                name="confPassword"
                value={formData.confPassword}
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
            <Subtitle> Confirm Password </Subtitle>
            <Box textAlign="center">
                <Button type="submit" w="20vw" colorScheme="teal" mb={8} mt={6}>
                    Sign Up
                </Button>
            </Box>
        </FormControl>
    );
}

export function ClubUserForm(){
    const [formData, setFormData] = useState({
        displayName: "",
        location: "",
        username: "",
        email: "",
        password: "",
        confPassword: ""
    });
    const router = useRouter();

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onClubUserSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (formData.password !== formData.confPassword) {
            alert("Passwords don't match!");
            return;
        }
        const data = {
            username: formData.username,
            displayName: formData.displayName,
            location: formData.location,
            email: formData.email,
            password: formData.password
        };
        await signInClubUser(data);
        router.push('/');
    };

    return(
        <>
        <FormControl as="form" onSubmit={onClubUserSubmit}>
        <Input
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          mt={5}
          placeholder="Club Takis"
          color={'white'}
          variant="filled"
          bg={'gray.600'}
          mb={0}
          _hover={{bg: 'gray.800'}}
          _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Display Name </Subtitle>
        <Input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="clubTakis"
          color={'white'}
          type="username"
          variant="filled"
          bg={'gray.600'}
          mb={0}
          _hover={{bg: 'gray.800'}}
          _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Username </Subtitle>
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="club.takis@gmail.com"
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
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Athens, Greece"
          color={'white'}
          variant="filled"
          bg={'gray.600'}
          mb={0}
          _hover={{bg: 'gray.800'}}
          _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Location </Subtitle>
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
        <Input
          name="confPassword"
          value={formData.confPassword}
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
        <Subtitle> Confirm Password </Subtitle>
        <Box textAlign="center">
            <Button type="submit" w="20vw" colorScheme="teal" mb={8} mt={6}>
                Sign Up
            </Button>
        </Box>
        </FormControl>
        </>
    );
}

export function ServiceProviderForm(){
    return(
        <>
        <Input
        mt={5}
        placeholder="Takis"
        color={'white'}
        type="email"
        variant="filled"
        bg={'gray.600'}
        mb={0}
        _hover={{bg: 'gray.800'}}
        _focus={{bg: 'gray.800'}}
        />
        <Subtitle> First Name </Subtitle>
        <Input
        placeholder="Tsimpoukakis"
        color={'white'}
        type="email"
        variant="filled"
        bg={'gray.600'}
        mb={0}
        _hover={{bg: 'gray.800'}}
        _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Last Name </Subtitle>
        <Input
            placeholder="DJTakis"
            color={'white'}
            variant="filled"
            bg={'gray.600'}
            mb={0}
            _hover={{bg: 'gray.800'}}
            _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Display Name </Subtitle>
        <Input
            placeholder="takis-tsimp"
            color={'white'}
            type="username"
            variant="filled"
            bg={'gray.600'}
            mb={0}
            _hover={{bg: 'gray.800'}}
            _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Username </Subtitle>
        <Input
            placeholder="dj.takis@gmail.com"
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
            placeholder="Athens, Greece"
            color={'white'}
            variant="filled"
            bg={'gray.600'}
            mb={0}
            _hover={{bg: 'gray.800'}}
            _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Location </Subtitle>
        <Input
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
        <Input
            placeholder="**********"
            color={'white'}
            type="password"
            variant="filled"
            bg={'gray.600'}
            mb={0}
            _hover={{bg: 'gray.800'}}
            _focus={{bg: 'gray.800'}}
        />
        <Subtitle> Confirm Password </Subtitle>
        </>
    );
}