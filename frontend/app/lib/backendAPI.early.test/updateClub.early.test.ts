
// Unit tests for: updateClub


import axios from "axios";
import { updateClub } from '../backendAPI';



jest.mock("axios");

describe('updateClub() updateClub method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return response data when the update is successful', async () => {
        // Arrange
        const mockResponse = { data: { success: true } };
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);
        const id = '123';
        const clubData = { name: 'New Club Name' };

        // Act
        const result = await updateClub(id, clubData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${id}`, clubData);
        expect(result).toEqual(mockResponse.data);
    });

    it('should return null when there is a network error', async () => {
        // Arrange
        (axios.put as jest.Mock).mockRejectedValue(new Error('Network Error'));
        const id = '123';
        const clubData = { name: 'New Club Name' };

        // Act
        const result = await updateClub(id, clubData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${id}`, clubData);
        expect(result).toBeNull();
    });

    it('should handle invalid club ID gracefully', async () => {
        // Arrange
        const mockResponse = { data: { success: false, message: 'Invalid ID' } };
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);
        const id = ''; // Invalid ID
        const clubData = { name: 'New Club Name' };

        // Act
        const result = await updateClub(id, clubData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${id}`, clubData);
        expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty club data gracefully', async () => {
        // Arrange
        const mockResponse = { data: { success: false, message: 'No data provided' } };
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);
        const id = '123';
        const clubData = {}; // Empty data

        // Act
        const result = await updateClub(id, clubData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${id}`, clubData);
        expect(result).toEqual(mockResponse.data);
    });

    it('should handle unexpected errors gracefully', async () => {
        // Arrange
        (axios.put as jest.Mock).mockRejectedValue(new Error('Unexpected Error'));
        const id = '123';
        const clubData = { name: 'New Club Name' };

        // Act
        const result = await updateClub(id, clubData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/club/${id}`, clubData);
        expect(result).toBeNull();
    });
});

// End of unit tests for: updateClub
