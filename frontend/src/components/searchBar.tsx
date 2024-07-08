import { Input } from '@chakra-ui/react';

const SearchBar = () => {

  return (
    <>
    <Input
        bg="white"
        placeholder='Search for Clubs'
        borderRadius="999px"
        width="80%"
        alignSelf="center"
        marginTop="30px"
        borderWidth="1px"
        borderColor="#353839"
        height="70px"
        size="lg"
        _placeholder={{ fontSize: 20 }}
    />
    </>
  );
};

export default SearchBar;