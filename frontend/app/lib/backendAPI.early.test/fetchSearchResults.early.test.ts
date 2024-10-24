
// Unit tests for: fetchSearchResults


import axios from "axios";
import { fetchSearchResults } from '../backendAPI';



jest.mock("axios");

describe('fetchSearchResults() fetchSearchResults method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return search results when API call is successful', async () => {
    // Arrange
    const mockData = { data: { results: ['result1', 'result2'] } };
    (axios.get as jest.Mock).mockResolvedValue(mockData);
    const searchQuery = 'test';

    // Act
    const result = await fetchSearchResults(searchQuery);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
    expect(result).toEqual(mockData.data.results);
  });

  it('should handle empty search query gracefully', async () => {
    // Arrange
    const mockData = { data: { results: [] } };
    (axios.get as jest.Mock).mockResolvedValue(mockData);
    const searchQuery = '';

    // Act
    const result = await fetchSearchResults(searchQuery);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
    expect(result).toEqual(mockData.data.results);
  });

  it('should throw an error when API call fails', async () => {
    // Arrange
    const errorMessage = 'Network Error';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));
    const searchQuery = 'test';

    // Act & Assert
    await expect(fetchSearchResults(searchQuery)).rejects.toThrow(errorMessage);
  });

  it('should handle non-string search query by converting it to string', async () => {
    // Arrange
    const mockData = { data: { results: ['result1'] } };
    (axios.get as jest.Mock).mockResolvedValue(mockData);
    const searchQuery = 12345;

    // Act
    const result = await fetchSearchResults(searchQuery);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(String(searchQuery)));
    expect(result).toEqual(mockData.data.results);
  });

  it('should handle special characters in search query', async () => {
    // Arrange
    const mockData = { data: { results: ['result1'] } };
    (axios.get as jest.Mock).mockResolvedValue(mockData);
    const searchQuery = '!@#$%^&*()';

    // Act
    const result = await fetchSearchResults(searchQuery);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
    expect(result).toEqual(mockData.data.results);
  });
});

// End of unit tests for: fetchSearchResults
