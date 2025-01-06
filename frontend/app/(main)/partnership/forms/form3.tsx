import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
} from '@chakra-ui/react';

interface FormData {
  [key: string]: any;
}

const Form3 = ({ formData, setFormData }: { formData: FormData; setFormData: any }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleContactInfoChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev: { contactInfo: any; }) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value }
    }));
  };

  const handleSocialMediaChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev: { socialMediaLinks: any; }) => ({
      ...prev,
      socialMediaLinks: { ...prev.socialMediaLinks, [name]: value }
    }));
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Contact Information</FormLabel>
        <SimpleGrid columns={2} spacing={4}>
          <Input
            name="email"
            value={formData.contactInfo?.email || ''}
            onChange={handleContactInfoChange}
            placeholder="Email"
          />
          <Input
            name="phone"
            value={formData.contactInfo?.phone || ''}
            onChange={handleContactInfoChange}
            placeholder="Phone"
          />
        </SimpleGrid>
      </FormControl>

      <FormControl>
        <FormLabel>Social Media Links</FormLabel>
        <VStack spacing={2}>
          <InputGroup>
            <InputLeftAddon>
              https://facebook.com/
            </InputLeftAddon>
            <Input
              name="facebook"
              value={formData.socialMediaLinks?.facebook || ''}
              onChange={handleSocialMediaChange}
              placeholder="username"
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>
              https://instagram.com/
            </InputLeftAddon>
            <Input
              name="instagram"
              value={formData.socialMediaLinks?.instagram || ''}
              onChange={handleSocialMediaChange}
              placeholder="username"
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>
              https://twitter.com/
            </InputLeftAddon>
            <Input
              name="twitter"
              value={formData.socialMediaLinks?.twitter || ''}
              onChange={handleSocialMediaChange}
              placeholder="username"
            />
          </InputGroup>
        </VStack>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Images</FormLabel>
        <Input
          type="file"
          name="images"
          onChange={handleChange}
          accept="image/*"
          multiple
        />
      </FormControl>
    </VStack>
  );
};

export default Form3;