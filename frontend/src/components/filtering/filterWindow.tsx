//testing new git push

import {
    Stack,
    Box,
    Text,
    Tab,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    Tabs,
    RangeSliderThumb,
    TabList,
    Modal, ModalOverlay, ModalContent, Modal
  } from '@chakra-ui/react'

import FloatingInput from './floatingTextInput.tsx';
import { useState } from 'react';

const FilterWindow = () => {

    const [min, setMin] = useState(0);
    const [max, setMax] = useState(120);

    return (
    <Stack width="725px" height="1082px" maxWidth="100%" background={"#E9E9E9"} padding={10}>
      <Box>
        <Text
          fontFamily="Inter"
          lineHeight="1.2"
          fontWeight="bold"
          fontSize="36px"
          color="black"
        >
          Choose type of outing
        </Text>
        <Text
          fontFamily="Inter"
          lineHeight="1.5"
          fontWeight="regular"
          fontSize="20px"
          color="black"
        >
          Search for Clubs, Bars or even organized Parties
        </Text>
      </Box>
      <Box>
        <Tabs>
            <TabList>
                <Tab width="102px" height="59px">
                Club
                </Tab>
                <Tab width="84px" height="58px">
                Bar
                </Tab>
                <Tab width="110px" height="58px">
                Party
                </Tab>
            </TabList>
        </Tabs>
      </Box>
      <Box>
        <Text
          fontFamily="Inter"
          lineHeight="1.2"
          fontWeight="bold"
          fontSize="36px"
          color="black"
        >
          Price Range
        </Text>
        <Text
          fontFamily="Inter"
          lineHeight="1.5"
          fontWeight="regular"
          fontSize="20px"
          color="black"
        >
          Limit the minimum price per table to a price range
        </Text>
      </Box>
        <RangeSlider value={[min/4, max/4]} size="lg" width="672px" height="50px" maxWidth="100%" defaultValue={[0,30]} 
        onChange={(val) => {setMin(val[0]*4); setMax(val[1]*4);}}
        >
          <RangeSliderThumb index={0}/>
          <RangeSliderTrack background={"gray.200"}>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb index={1}/>
        </RangeSlider>
        <Stack flexDirection="row" alignItems="center">
        <FloatingInput inputLabel={(min).toString()} setInputLabel={setMin}/>
        <FloatingInput inputLabel={(max).toString()} setInputLabel={setMax}/>
        </Stack>
      <Box>
        <Text
          fontFamily="Inter"
          lineHeight="1.2"
          fontWeight="bold"
          fontSize="36px"
          color="black"
        >
          Distance
        </Text>
        <Text
          fontFamily="Inter"
          lineHeight="1.5"
          fontWeight="regular"
          fontSize="20px"
          color="#000000"
        >
          from
        </Text>
        <Text
          fontFamily="Inter"
          lineHeight="1.5"
          fontWeight="regular"
          fontSize="20px"
          color="#0A61C8"
        >
          Dimitriou Soutsou 17
        </Text>
      </Box>
    </Stack>
    );
};

export default FilterWindow;