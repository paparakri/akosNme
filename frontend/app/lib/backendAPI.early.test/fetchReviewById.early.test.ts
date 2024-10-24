
// Unit tests for: fetchReviewById


import axios from "axios";
import { fetchReviewById } from '../backendAPI';



jest.mock("axios");

describe('fetchReviewById() fetchReviewById method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return data when the request is successful', async () => {
        // Arrange: Mock axios to return a successful response
        const mockData = { id: '123', review: 'Great product!' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with a valid ID
        const result = await fetchReviewById('123');

        // Assert: Verify that the function returns the expected data
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/review/123');
    });

    it('should return null when the request fails', async () => {
        // Arrange: Mock axios to simulate a network error
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act: Call the function with a valid ID
        const result = await fetchReviewById('123');

        // Assert: Verify that the function returns null on error
        expect(result).toBeNull();
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/review/123');
    });

    it('should handle non-string ID inputs gracefully', async () => {
        // Arrange: Mock axios to return a successful response
        const mockData = { id: '123', review: 'Great product!' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with a non-string ID
        const result = await fetchReviewById(123 as any);

        // Assert: Verify that the function still calls axios with a stringified ID
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/review/123');
    });

    it('should log an error message when the request fails', async () => {
        // Arrange: Mock axios to simulate a network error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act: Call the function with a valid ID
        await fetchReviewById('123');

        // Assert: Verify that an error message is logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error fetching review 123 info: ',
            expect.any(Error)
        );

        // Clean up
        consoleErrorSpy.mockRestore();
    });
});

// End of unit tests for: fetchReviewById
