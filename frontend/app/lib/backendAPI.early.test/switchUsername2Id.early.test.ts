
// Unit tests for: switchUsername2Id


import axios from "axios";
import { switchUsername2Id } from '../backendAPI';



jest.mock("axios");

describe('switchUsername2Id() switchUsername2Id method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the user ID when the API call is successful', async () => {
        // Arrange: Mock axios to return a successful response
        const mockResponse = { data: { _id: '12345' } };
        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        // Act: Call the function with a sample username
        const result = await switchUsername2Id('testuser');

        // Assert: Verify that the function returns the correct ID
        expect(result).toBe('12345');
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/testuser/byName');
    });

    it('should handle errors gracefully when the API call fails', async () => {
        // Arrange: Mock axios to throw an error
        const mockError = new Error('Network Error');
        (axios.get as jest.Mock).mockRejectedValue(mockError);

        // Act: Call the function with a sample username
        const result = await switchUsername2Id('testuser');

        // Assert: Verify that the function returns undefined on error
        expect(result).toBeUndefined();
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/testuser/byName');
    });

    it('should handle cases where the response does not contain an _id', async () => {
        // Arrange: Mock axios to return a response without an _id
        const mockResponse = { data: {} };
        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        // Act: Call the function with a sample username
        const result = await switchUsername2Id('testuser');

        // Assert: Verify that the function returns undefined when _id is missing
        expect(result).toBeUndefined();
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/user/testuser/byName');
    });
});

// End of unit tests for: switchUsername2Id
