
// Unit tests for: fetchClubReservations


import axios from "axios";
import { fetchClubReservations } from '../backendAPI';



jest.mock("axios");

describe('fetchClubReservations() fetchClubReservations method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch reservations successfully for a valid club name', async () => {
    // Arrange
    const clubName = 'ValidClub';
    const mockData = { data: [{ id: 1, name: 'Reservation1' }] };
    (axios.get as jest.Mock).mockResolvedValue(mockData);

    // Act
    const result = await fetchClubReservations(clubName);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(clubName));
    expect(result).toEqual(mockData.data);
  });

  it('should handle an error when the API call fails', async () => {
    // Arrange
    const clubName = 'ValidClub';
    const errorMessage = 'Network Error';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(fetchClubReservations(clubName)).rejects.toThrow(errorMessage);
  });

  it('should handle an empty club name', async () => {
    // Arrange
    const clubName = '';
    const errorMessage = 'Club name cannot be empty';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(fetchClubReservations(clubName)).rejects.toThrow(errorMessage);
  });

  it('should handle a null club name', async () => {
    // Arrange
    const clubName = null as unknown as string;
    const errorMessage = 'Club name cannot be null';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(fetchClubReservations(clubName)).rejects.toThrow(errorMessage);
  });

  it('should handle a non-string club name', async () => {
    // Arrange
    const clubName = 123 as unknown as string;
    const errorMessage = 'Club name must be a string';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(fetchClubReservations(clubName)).rejects.toThrow(errorMessage);
  });
});

// End of unit tests for: fetchClubReservations
