import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Progress,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';

const steps = [
  { name: 'Basic Info', fields: ['displayName', 'description'] },
  { name: 'Location', fields: ['location'] },
  { name: 'Pricing', fields: ['formattedPrice'] },
  { name: 'Features', fields: ['features'] },
  { name: 'Photos', fields: ['photos'] },
];

const ClubOnboarding = ({ clubData, setClubData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClubData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(clubData);
      toast({
        title: "Onboarding complete",
        description: "Your club profile has been set up successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderField = (field) => {
    switch (field) {
      case 'description':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name={field}
              value={clubData[field] || ''}
              onChange={handleInputChange}
              placeholder="Describe your club"
            />
          </FormControl>
        );
      case 'formattedPrice':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Price (€ per min)</FormLabel>
            <Input
              type="number"
              name={field}
              value={clubData[field] || ''}
              onChange={handleInputChange}
              placeholder="Enter price"
            />
          </FormControl>
        );
      case 'features':
        return (
          <FormControl key={field}>
            <FormLabel>Features (comma-separated)</FormLabel>
            <Input
              name={field}
              value={clubData[field] || ''}
              onChange={handleInputChange}
              placeholder="e.g., DJ, VIP Area, Cocktail Bar"
            />
          </FormControl>
        );
      case 'photos':
        return (
          <FormControl key={field}>
            <FormLabel>Photo URLs (comma-separated)</FormLabel>
            <Input
              name={field}
              value={clubData[field] || ''}
              onChange={handleInputChange}
              placeholder="Enter photo URLs"
            />
          </FormControl>
        );
      default:
        return (
          <FormControl key={field} isRequired>
            <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
            <Input
              name={field}
              value={clubData[field] || ''}
              onChange={handleInputChange}
              placeholder={`Enter ${field}`}
            />
          </FormControl>
        );
    }
  };

  return (
    <Box>
      <Progress value={(currentStep / (steps.length - 1)) * 100} mb={4} />
      <Heading size="lg" mb={4}>Club Setup: {steps[currentStep].name}</Heading>
      <VStack spacing={4} align="stretch">
        {steps[currentStep].fields.map(field => renderField(field))}
      </VStack>
      <Flex mt={4} justifyContent="space-between">
        <Button onClick={handlePrevious} isDisabled={currentStep === 0}>
          Previous
        </Button>
        <Button onClick={handleNext} colorScheme="orange">
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Flex>
    </Box>
  );
};

export default ClubOnboarding;