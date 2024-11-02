import React, { useState, useRef } from 'react';
import { 
  FormControl,
  Input,
  Box,
  List,
  ListItem,
  Text,
  VStack
} from '@chakra-ui/react';
import { MapPin } from 'lucide-react';
import debounce from 'lodash/debounce';
import { geocode } from '../lib/backendAPI';

const LocationInput = ({ formData, setFormData }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (formData.location?.displayString) {
      setInputValue(formData.location.displayString);
    }
  }, [formData.location?.displayString]);

  const debouncedFetch = useRef(
    debounce(async (searchText) => {
      if (!searchText) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const suggestion = await geocode(searchText);
        console.log('Printing suggestions from API: ', suggestion);
        setSuggestions(suggestion);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedFetch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.display_name);
    setSuggestions([]);
    
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [parseFloat(suggestion.lon), parseFloat(suggestion.lat)],
        displayString: suggestion.display_name
      }
    }));
  };

  const formatAddress = (display_name) => {
    const parts = display_name.split(', ');
    return {
      street: parts[0],
      area: parts[1],
      region: parts.slice(2, 4).join(', ')
    };
  };

  return (
    <FormControl isRequired>
      <VStack spacing={0} align="stretch" className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Εισάγετε τη διεύθυνση του μαγαζιού σας"
          className="w-full"
        />
        
        {suggestions.length > 0 && (
          <Box className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 top-full max-h-64 overflow-y-auto">
            <List className="py-1 divide-y divide-gray-100">
              {suggestions.map((suggestion) => {
                const address = formatAddress(suggestion.display_name);
                return (
                  <ListItem
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <Text className="font-medium text-sm">
                          {address.street}
                          {address.area && <span className="text-gray-500">, {address.area}</span>}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {address.region}
                        </Text>
                      </div>
                    </div>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
        
        {isLoading && (
          <Text className="text-sm text-gray-500 mt-1">Αναζήτηση...</Text>
        )}
      </VStack>
    </FormControl>
  );
};

export default LocationInput;