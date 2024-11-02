import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
} from '@chakra-ui/react';
import LocationInput from '@/app/ui/locationSelector';

interface Form2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Form2: React.FC<Form2Props> = ({ formData, setFormData }) => {
  const handleChange = (e: any) => {
    //console.log(e);
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    //console.log(formData);
  };

  const handleCheckboxChange = (name: string, values: (string | number)[]) => {
    setFormData((prev: any) => ({ ...prev, [name]: values }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  //console.log(formData);

  return (
    <VStack spacing={4} align="stretch">
        <FormControl isRequired>
        <FormLabel>Location</FormLabel>
        <LocationInput formData={formData} setFormData={setFormData} />
        </FormControl>
        <FormControl isRequired>
        <FormLabel>Capacity</FormLabel>
        <NumberInput
            min={1}
            onChange={(valueString) => handleNumberChange('capacity', parseInt(valueString))}
            value={formData.capacity || ''}
        >
            <NumberInputField />
            <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
        </FormControl>
      <FormControl isRequired>
        <FormLabel>Opening Hours</FormLabel>
        <Input
          name="openingHours"
          value={formData.openingHours || ''}
          onChange={handleChange}
          placeholder="e.g., Mon-Fri: 8pm-2am, Sat-Sun: 9pm-3am"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Features</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          onChange={(values) => handleCheckboxChange('features', values)}
          value={formData.features || []}
        >
          <Wrap spacing={2}>
            {['DJ', 'Live Music', 'Dance Floor', 'VIP Area', 'Smoking Area', 'Outdoor Space'].map((feature) => (
              <WrapItem key={feature}>
                <Checkbox value={feature}>{feature}</Checkbox>
              </WrapItem>
            ))}
          </Wrap>
        </CheckboxGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Genres</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          onChange={(values) => handleCheckboxChange('genres', values)}
          value={formData.genres || []}
        >
          <Wrap spacing={2}>
            {['House', 'Techno', 'Hip Hop', 'R&B', 'Pop', 'Rock', 'Latin'].map((genre) => (
              <WrapItem key={genre}>
                <Checkbox value={genre}>{genre}</Checkbox>
              </WrapItem>
            ))}
          </Wrap>
        </CheckboxGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Minimum Age</FormLabel>
        <NumberInput
          min={18}
          onChange={(valueString) => handleNumberChange('minAge', parseInt(valueString))}
          value={formData.minAge || ''}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Dress Code</FormLabel>
        <Select
          name="dressCode"
          value={formData.dressCode || ''}
          onChange={handleChange}
          placeholder="Select dress code"
        >
          <option value="no dress code">No Dress Code</option>
          <option value="casual">Casual</option>
          <option value="smart casual">Smart Casual</option>
          <option value="formal">Formal</option>
          <option value="themed">Themed</option>
        </Select>
      </FormControl>
    </VStack>
  );
};

export default Form2;