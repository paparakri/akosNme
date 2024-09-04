"use client"
import { Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

export default function CustomRadio() {
    const [value, setValue] = useState('1')
    return (
      <RadioGroup onChange={setValue} value={value}>
        <Stack direction='row'>
          <Radio value='1'> <Text color={'gray.400'}>Normal User</Text></Radio>
          <Radio value='2'> <Text color={'gray.400'}>Club User</Text></Radio>
          <Radio value='3'> <Text color={'gray.400'}>Service Provider</Text></Radio>
        </Stack>
      </RadioGroup>
    )
  }