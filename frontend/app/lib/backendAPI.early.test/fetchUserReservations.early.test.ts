
// Unit tests for: fetchUserReservations


import axios from "axios";
import { fetchUserReservations } from '../backendAPI';



jest.mock("axios");

describe('fetchUserReservations() fetchUserReservations method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch reservations successfully for a valid username', async () => {
    // Arrange
    const mockUsername = 'validUser';
    const mockResponse = { data: [{ id: 1, reservation: 'Reservation 1' }] };
    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await fetchUserReservations(mockUsername);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(`/reservations/${mockUsername}`);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle no reservations found for a valid username', async () => {
    // Arrange
    const mockUsername = 'userWithNoReservations';
    const mockResponse = { data: [] };
    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await fetchUserReservations(mockUsername);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(`/reservations/${mockUsername}`);
    expect(result).toEqual([]);
  });

  it('should throw an error if the username is invalid', async () => {
    // Arrange
    const mockUsername = '';
    const mockError = new Error('Invalid username');
    (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(fetchUserReservations(mockUsername)).rejects.toThrow('Invalid username');
    expect(axios.get).toHaveBeenCalledWith(`/reservations/${mockUsername}`);
  });

  it('should handle network errors gracefully', async () => {
    // Arrange
    const mockUsername = 'networkErrorUser';
    const mockError = new Error('Network Error');
    (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(fetchUserReservations(mockUsername)).rejects.toThrow('Network Error');
    expect(axios.get).toHaveBeenCalledWith(`/reservations/${mockUsername}`);
  });

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const mockUsername = 'unexpectedErrorUser';
    const mockError = new Error('Unexpected Error');
    (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(fetchUserReservations(mockUsername)).rejects.toThrow('Unexpected Error');
    expect(axios.get).toHaveBeenCalledWith(`/reservations/${mockUsername}`);
  });
});

// End of unit tests for: fetchUserReservations
