
// Unit tests for: fetchFeaturedClubs


import axios from "axios";
import { fetchFeaturedClubs } from '../backendAPI';



jest.mock("axios");

describe('fetchFeaturedClubs() fetchFeaturedClubs method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return data when the API call is successful', async () => {
        // Arrange: Mock axios.post to resolve with a successful response
        const mockData = { clubs: ['Club A', 'Club B'] };
        (axios.post as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with a sample location
        const result = await fetchFeaturedClubs('New York');

        // Assert: Verify that the function returns the expected data
        expect(result).toEqual(mockData);
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:5000/featured-clubs', { location: 'New York' });
    });

    it('should return null when the API call fails', async () => {
        // Arrange: Mock axios.post to reject with an error
        (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act: Call the function with a sample location
        const result = await fetchFeaturedClubs('Los Angeles');

        // Assert: Verify that the function returns null on error
        expect(result).toBeNull();
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:5000/featured-clubs', { location: 'Los Angeles' });
    });

    it('should handle empty location input gracefully', async () => {
        // Arrange: Mock axios.post to resolve with a successful response
        const mockData = { clubs: [] };
        (axios.post as jest.Mock).mockResolvedValue({ data: mockData });

        // Act: Call the function with an empty location
        const result = await fetchFeaturedClubs('');

        // Assert: Verify that the function returns the expected data
        expect(result).toEqual(mockData);
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:5000/featured-clubs', { location: '' });
    });

    it('should handle unexpected response structure gracefully', async () => {
        // Arrange: Mock axios.post to resolve with an unexpected response structure
        const unexpectedData = { unexpectedKey: 'unexpectedValue' };
        (axios.post as jest.Mock).mockResolvedValue({ data: unexpectedData });

        // Act: Call the function with a sample location
        const result = await fetchFeaturedClubs('Chicago');

        // Assert: Verify that the function returns the unexpected data
        expect(result).toEqual(unexpectedData);
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:5000/featured-clubs', { location: 'Chicago' });
    });
});

// End of unit tests for: fetchFeaturedClubs
