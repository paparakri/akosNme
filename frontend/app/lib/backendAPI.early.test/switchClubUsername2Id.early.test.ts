
// Unit tests for: switchClubUsername2Id


import axios from "axios";
import { switchClubUsername2Id } from '../backendAPI';



jest.mock("axios");

describe('switchClubUsername2Id() switchClubUsername2Id method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the club ID when the API call is successful', async () => {
        // Arrange: Mock axios to return a successful response
        const mockResponse = { data: { _id: '12345' } };
        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        // Act: Call the function with a sample username
        const result = await switchClubUsername2Id('sampleUsername');

        // Assert: Verify that the function returns the correct ID
        expect(result).toBe('12345');
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/sampleUsername/byName');
    });

    it('should handle errors gracefully when the API call fails', async () => {
        // Arrange: Mock axios to throw an error
        const mockError = new Error('Network Error');
        (axios.get as jest.Mock).mockRejectedValue(mockError);

        // Act: Call the function with a sample username
        const result = await switchClubUsername2Id('sampleUsername');

        // Assert: Verify that the function returns undefined on error
        expect(result).toBeUndefined();
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/sampleUsername/byName');
    });

    it('should log the response when the API call is successful', async () => {
        // Arrange: Mock axios to return a successful response
        const mockResponse = { data: { _id: '12345' } };
        (axios.get as jest.Mock).mockResolvedValue(mockResponse);
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        // Act: Call the function with a sample username
        await switchClubUsername2Id('sampleUsername');

        // Assert: Verify that the response is logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Printing response from switchClubUsername2Id: ', mockResponse);

        // Clean up
        consoleLogSpy.mockRestore();
    });

    it('should log an error message when the API call fails', async () => {
        // Arrange: Mock axios to throw an error
        const mockError = new Error('Network Error');
        (axios.get as jest.Mock).mockRejectedValue(mockError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Act: Call the function with a sample username
        await switchClubUsername2Id('sampleUsername');

        // Assert: Verify that the error is logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error switching club username to id for sampleUsername: ', mockError);

        // Clean up
        consoleErrorSpy.mockRestore();
    });
});

// End of unit tests for: switchClubUsername2Id
