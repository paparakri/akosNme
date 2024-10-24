
// Unit tests for: postReservation


import axios from "axios";
import { postReservation } from '../backendAPI';



jest.mock("axios");

describe('postReservation() postReservation method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return data when the reservation is posted successfully', async () => {
        // Arrange
        const mockData = { id: 1, name: 'Test Reservation' };
        (axios.post as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await postReservation(mockData);

        // Assert
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:3500/reservations', mockData);
        expect(result).toEqual(mockData);
    });

    it('should return null when there is a network error', async () => {
        // Arrange
        const mockData = { id: 1, name: 'Test Reservation' };
        (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act
        const result = await postReservation(mockData);

        // Assert
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:3500/reservations', mockData);
        expect(result).toBeNull();
    });

    it('should return null when an unexpected error occurs', async () => {
        // Arrange
        const mockData = { id: 1, name: 'Test Reservation' };
        (axios.post as jest.Mock).mockRejectedValue(new Error('Unexpected Error'));

        // Act
        const result = await postReservation(mockData);

        // Assert
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:3500/reservations', mockData);
        expect(result).toBeNull();
    });

    it('should handle empty reservation data gracefully', async () => {
        // Arrange
        const mockData = {};
        (axios.post as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await postReservation(mockData);

        // Assert
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:3500/reservations', mockData);
        expect(result).toEqual(mockData);
    });

    it('should handle null reservation data gracefully', async () => {
        // Arrange
        const mockData = null;
        (axios.post as jest.Mock).mockResolvedValue({ data: mockData });

        // Act
        const result = await postReservation(mockData);

        // Assert
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:3500/reservations', mockData);
        expect(result).toEqual(mockData);
    });
});

// End of unit tests for: postReservation
