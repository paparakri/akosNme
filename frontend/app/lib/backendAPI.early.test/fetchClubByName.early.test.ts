
// Unit tests for: fetchClubByName


import axios from "axios";
import { fetchClubByName } from '../backendAPI';



jest.mock("axios");

describe('fetchClubByName() fetchClubByName method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return club data when the API call is successful', async () => {
        // Arrange
        const clubName = 'TestClub';
        const mockData = { id: 1, name: 'TestClub' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await fetchClubByName(clubName);

        // Assert
        expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${clubName}/byName`);
        expect(result).toEqual(mockData);
    });

    it('should return null when the API call fails', async () => {
        // Arrange
        const clubName = 'NonExistentClub';
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act
        const result = await fetchClubByName(clubName);

        // Assert
        expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${clubName}/byName`);
        expect(result).toBeNull();
    });

    it('should handle empty club name gracefully', async () => {
        // Arrange
        const clubName = '';
        const mockData = { id: 2, name: '' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await fetchClubByName(clubName);

        // Assert
        expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${clubName}/byName`);
        expect(result).toEqual(mockData);
    });

    it('should handle special characters in club name', async () => {
        // Arrange
        const clubName = 'Club@123';
        const mockData = { id: 3, name: 'Club@123' };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await fetchClubByName(clubName);

        // Assert
        expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${clubName}/byName`);
        expect(result).toEqual(mockData);
    });
});

// End of unit tests for: fetchClubByName
