
// Unit tests for: fetchClubInfo


import axios from "axios";
import { fetchClubInfo } from '../backendAPI';



jest.mock("axios");

describe('fetchClubInfo() fetchClubInfo method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return club info when the API call is successful', async () => {
    // Arrange: Mock axios to return a successful response
    const mockData = { clubName: 'Test Club', members: 42 };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    // Act: Call the function with a test user
    const result = await fetchClubInfo('testUser');

    // Assert: Verify the function returns the expected data
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/testUser', {
      headers: { username: 'testUser' },
    });
  });

  it('should return null when the API call fails', async () => {
    // Arrange: Mock axios to simulate a network error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    // Act: Call the function with a test user
    const result = await fetchClubInfo('testUser');

    // Assert: Verify the function returns null on error
    expect(result).toBeNull();
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/testUser', {
      headers: { username: 'testUser' },
    });
  });

  it('should handle empty user input gracefully', async () => {
    // Arrange: Mock axios to return a successful response
    const mockData = { clubName: 'Default Club', members: 0 };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    // Act: Call the function with an empty string as user
    const result = await fetchClubInfo('');

    // Assert: Verify the function returns the expected data
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/', {
      headers: { username: '' },
    });
  });

  it('should handle null user input gracefully', async () => {
    // Arrange: Mock axios to return a successful response
    const mockData = { clubName: 'Default Club', members: 0 };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    // Act: Call the function with null as user
    const result = await fetchClubInfo(null);

    // Assert: Verify the function returns the expected data
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:3500/club/null', {
      headers: { username: null },
    });
  });
});

// End of unit tests for: fetchClubInfo
