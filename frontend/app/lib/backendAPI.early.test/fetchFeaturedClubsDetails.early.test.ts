
// Unit tests for: fetchFeaturedClubsDetails


import axios from "axios";
import { fetchFeaturedClubsDetails } from '../backendAPI';



jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchFeaturedClubsDetails() fetchFeaturedClubsDetails method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return club details when fetchFeaturedClubs and fetchClubByName succeed', async () => {
        // Mocking fetchFeaturedClubs response
        const mockFeaturedClubsData = { clubs: [{ username: 'club1' }, { username: 'club2' }] };
        mockedAxios.post.mockResolvedValueOnce({ data: mockFeaturedClubsData });

        // Mocking fetchClubByName responses
        const mockClubDetails1 = { name: 'Club 1', location: 'Location 1' };
        const mockClubDetails2 = { name: 'Club 2', location: 'Location 2' };
        mockedAxios.get
            .mockResolvedValueOnce({ data: mockClubDetails1 })
            .mockResolvedValueOnce({ data: mockClubDetails2 });

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([mockClubDetails1, mockClubDetails2]);
    });

    it('should return an empty array if fetchFeaturedClubs returns null', async () => {
        // Mocking fetchFeaturedClubs to return null
        mockedAxios.post.mockResolvedValueOnce({ data: null });

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([]);
    });

    it('should return an empty array if fetchFeaturedClubs returns non-object data', async () => {
        // Mocking fetchFeaturedClubs to return a non-object
        mockedAxios.post.mockResolvedValueOnce({ data: 'invalid-data' });

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([]);
    });

    it('should return an empty array if clubUsernames is not an array', async () => {
        // Mocking fetchFeaturedClubs to return an object with non-array clubUsernames
        const mockFeaturedClubsData = { clubs: 'not-an-array' };
        mockedAxios.post.mockResolvedValueOnce({ data: mockFeaturedClubsData });

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([]);
    });

    it('should filter out null values from fetchClubByName results', async () => {
        // Mocking fetchFeaturedClubs response
        const mockFeaturedClubsData = { clubs: [{ username: 'club1' }, { username: 'club2' }] };
        mockedAxios.post.mockResolvedValueOnce({ data: mockFeaturedClubsData });

        // Mocking fetchClubByName responses
        const mockClubDetails1 = { name: 'Club 1', location: 'Location 1' };
        mockedAxios.get
            .mockResolvedValueOnce({ data: mockClubDetails1 })
            .mockResolvedValueOnce({ data: null }); // Simulating a failed fetch

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([mockClubDetails1]);
    });

    it('should return an empty array if an error occurs during fetchFeaturedClubs', async () => {
        // Mocking fetchFeaturedClubs to throw an error
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([]);
    });

    it('should return an empty array if an error occurs during fetchClubByName', async () => {
        // Mocking fetchFeaturedClubs response
        const mockFeaturedClubsData = { clubs: [{ username: 'club1' }] };
        mockedAxios.post.mockResolvedValueOnce({ data: mockFeaturedClubsData });

        // Mocking fetchClubByName to throw an error
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await fetchFeaturedClubsDetails('some-location');
        expect(result).toEqual([]);
    });
});

// End of unit tests for: fetchFeaturedClubsDetails
