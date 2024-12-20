'use client'

import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

type ContactInfo = {
    email: string;
    phone: string;
  };
  
  type SocialMediaLinks = {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  
  // Define the main ClubFormData type
  interface ClubFormData {
    username: string;
    email: string;
    displayName: string;
    description: string;
    location: string;
    capacity: number | string; // Can be number or empty string
    openingHours: string;
    features: string[];
    genres: string[];
    minAge: number | string; // Can be number or empty string
    dressCode: string;
    contactInfo: ContactInfo;
    socialMediaLinks: SocialMediaLinks;
    images: FileList | null;
    password: string;
  };

const Form1 = ({ formData, setFormData }: { formData: ClubFormData; setFormData: any }) => {
    const [confPass, setConfPass] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Club Name</FormLabel>
        <Input
            name="displayName"
            value={formData.displayName || ''}
            onChange={handleChange}
            placeholder="Enter your club's name"
        />
    </FormControl>
    <FormControl isRequired>
        <FormLabel>e-Mail</FormLabel>
        <Input
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Enter your club's email"
        />
    </FormControl>
        
        <FormControl isRequired>
        <FormLabel>Username</FormLabel>
        <Input
            name="username"
            value={formData.username || ''}
            onChange={handleChange}
            placeholder="Enter your username"
        />
        </FormControl>
        <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <Input
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            placeholder="Enter your password"
        />
        </FormControl>
        <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <Input
            type="password"
            name="confirmPassword"
            value={confPass || ''}
            onChange={(e) => setConfPass(e.target.value)}
            placeholder="Confirm your password"
        />
        </FormControl>
        <FormControl isRequired>
        <FormLabel>Description</FormLabel>
        <Textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Describe your club"
        />
        </FormControl>
    </VStack>
  );
};

export default Form1;