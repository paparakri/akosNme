'use client'

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

import Form1 from './forms/form1';
import Form2 from './forms/form2';
import Form3 from './forms/form3';
import FaqPage from '../faq/page';
import { signInClubUser } from '../lib/authHelper';

interface PartnershipFeatureProps {
  icon: string;
  title: string;
  description: string;
}

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
  type ClubFormData = {
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

const PartnershipFeature: React.FC<PartnershipFeatureProps> = ({ icon, title, description }) => (
  <VStack align="center" p={4} bg="gray.50" borderRadius="md" textAlign={'center'}>
    <Image src={icon} /*alt={title}*/ maxW={50}/>
    <Text fontWeight="bold">{title}</Text>
    <Text textAlign="center">{description}</Text>
  </VStack>
);

const PartnershipStep: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <VStack align="center" p={4} bg="gray.50" borderRadius="md" textAlign={'center'}>
    <Image src={icon} /*alt={title}*/ maxW={50} />
    <Text fontWeight="bold">{title}</Text>
    <Text textAlign="center">{description}</Text>
  </VStack>
);

const ClubPartneringPage = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33.33);
  const [formData, setFormData] = useState<ClubFormData>(
    {
      username: '',
      email: '',
      displayName: '',
      description: '',
      location: '',
      capacity: '',
      openingHours: '',
      features: [],
      genres: [],
      minAge: '',
      dressCode: '',
      contactInfo: {
        email: '',
        phone: '',
      },
      socialMediaLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
      images: null,
      password: '',
    }
  );

  const toast = useToast();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      setProgress(progress + 33.33);
    } else {
      signInClubUser(formData);
      toast({
        title: "Partnership request submitted.",
        description: "We'll review your information and get back to you soon.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(progress - 33.33);
    }
  };

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={10}>
        <Heading as="h1" size="2xl">Become a Partner Club</Heading>
        
        <Flex w="100%" justifyContent="space-between">
          <Box flex={1} pr={10}>
            <VStack align="start" spacing={6}>
              <Text fontSize="xl">Join our platform and boost your club's visibility!</Text>
              <Text>Fill out the form to start the partnership process. We'll review your information and get back to you soon.</Text>
              
              <Progress hasStripe value={progress} w="100%" colorScheme="orange" mb={4} />
              
              <Box w="100%" bg="white" p={6} borderRadius="md" boxShadow="md">
                {step === 1 && <Form1 formData={formData} setFormData={setFormData}/>}
                {step === 2 && <Form2 formData={formData} setFormData={setFormData}/>}
                {step === 3 && <Form3 formData={formData} setFormData={setFormData}/>}
              </Box>
              <HStack w="100%" justifyContent="space-between">
                <Button onClick={handleBack} isDisabled={step === 1}>
                  Back
                </Button>
                <Button rightIcon={<ArrowForwardIcon />} colorScheme="orange" onClick={handleNext}>
                  {step === 3 ? 'Submit' : 'Next'}
                </Button>
              </HStack>
            </VStack>
          </Box>
          
          <VStack flex={1} align="start" spacing={10} pt={'40'}>
            <Box>
              <Heading as="h3" size="lg" mb={4}>Why Partner With Us?</Heading>
              <HStack spacing={4}>
                <PartnershipFeature 
                  icon="/icons/visibility.png"
                  title="Increased Visibility"
                  description="Get your club in front of thousands of potential customers."
                />
                <PartnershipFeature 
                  icon="/icons/reservations.png"
                  title="Easy Reservations"
                  description="Streamline your booking process and reduce no-shows."
                />
                <PartnershipFeature 
                  icon="/icons/analytics.png"
                  title="Insightful Analytics"
                  description="Gain valuable data on your club's performance and customer preferences."
                />
              </HStack>
            </Box>
          </VStack>
        </Flex>
        <Box>
            <Heading as="h3" size="lg" mb={4}>How It Works</Heading>
            <Flex w={'100%'} direction={'row'}>
            <PartnershipStep 
                icon="/icons/form.png"
                title="1. Complete the Form"
                description="Provide us with essential information about your club."
            />
            <PartnershipStep 
                icon="/icons/review.png"
                title="2. We'll Review"
                description="Our team will carefully review your application."
            />
            <PartnershipStep 
                icon="/icons/onboarding.png"
                title="3. Get Onboarded"
                description="Once approved, we'll guide you through the setup process."
            />
            <PartnershipStep 
                icon="/icons/success.png"
                title="4. Start Accepting Reservations"
                description="Launch your profile and begin receiving bookings!"
            />
            </Flex>
        </Box>
        <FaqPage />
      </VStack>
    </Container>
  );
};

export default ClubPartneringPage;