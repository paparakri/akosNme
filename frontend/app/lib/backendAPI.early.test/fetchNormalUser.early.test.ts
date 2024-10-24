
// Unit tests for: fetchNormalUser


import axios from "axios";
import { fetchNormalUser } from '../backendAPI';



jest.mock("axios");

describe('fetchNormalUser() fetchNormalUser method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return user data when the API call is successful', async () => {
        // Arrange: Mock axios to return a successful response
        const mockData = { id: '123', name: 'John Doe' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with a valid user ID
        const result = await fetchNormalUser('123');

        // Assert: Verify that the function returns the expected data
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/123');
    });

    it('should return null when the API call fails', async () => {
        // Arrange: Mock axios to simulate a network error
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act: Call the function with a valid user ID
        const result = await fetchNormalUser('123');

        // Assert: Verify that the function returns null on error
        expect(result).toBeNull();
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/123');
    });

    it('should handle edge case of empty user ID', async () => {
        // Arrange: Mock axios to return a successful response for an empty ID
        const mockData = { id: '', name: 'Anonymous' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with an empty user ID
        const result = await fetchNormalUser('');

        // Assert: Verify that the function returns the expected data for an empty ID
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/');
    });

    it('should handle edge case of special characters in user ID', async () => {
        // Arrange: Mock axios to return a successful response for a special character ID
        const specialId = '!@#$%^&*()';
        const mockData = { id: specialId, name: 'Special User' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with a special character user ID
        const result = await fetchNormalUser(specialId);

        // Assert: Verify that the function returns the expected data for a special character ID
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${specialId}`);
    });
});

// End of unit tests for: fetchNormalUser
