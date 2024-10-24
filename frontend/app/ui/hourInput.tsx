import React from 'react';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

interface HourInputProps {
  value: number;
  afterLabel: string;
  onChange: (value: number) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

const HourInput: React.FC<HourInputProps> = ({
  value,
  onChange,
  afterLabel,
  isInvalid = false,
  errorMessage = 'Invalid input',
}) => {
  const handleChange = (valueString: string, valueNumber: number) => {
    onChange(valueNumber);
  };

  return (
    <FormControl isInvalid={isInvalid} display="flex" alignItems="center">
      <InputGroup width="auto">
        <NumberInput
          value={value}
          onChange={handleChange}
          min={0}
          max={72}
          step={1}
          clampValueOnBlur={false}
          size="sm"
          width="60px"
        >
          <NumberInputField
            textAlign="center"
            borderRadius="md"
            height="40px"
          />
          <InputRightElement height="40px" paddingRight="5px">
            <span style={{ fontSize: '16px' }}>h</span>
          </InputRightElement>
        </NumberInput>
      </InputGroup>
      <span style={{ marginLeft: '10px' }}>{afterLabel}</span>
      {isInvalid && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
};

export default HourInput;
