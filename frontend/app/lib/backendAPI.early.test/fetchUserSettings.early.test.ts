
// Unit tests for: fetchUserSettings


import { fetchNormalUser, fetchUserSettings } from '../backendAPI';



jest.mock("axios");

// jest.mock("../path-to-your-file", () => ({
//   ...jest.requireActual("../path-to-your-file"),
//   fetchNormalUser: jest.fn(),
// }));

describe('fetchUserSettings() fetchUserSettings method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user account settings when fetchNormalUser is successful', async () => {
    // Arrange: Mock fetchNormalUser to return a user with accountSettings
    const mockUser = { accountSettings: { theme: 'dark', notifications: true } };
    (fetchNormalUser as jest.Mock).mockResolvedValue(mockUser);

    // Act: Call fetchUserSettings
    const result = await fetchUserSettings('123');

    // Assert: Verify that the result matches the mock user's accountSettings
    expect(result).toEqual(mockUser.accountSettings);
  });

  it('should return null if fetchNormalUser returns null', async () => {
    // Arrange: Mock fetchNormalUser to return null
    (fetchNormalUser as jest.Mock).mockResolvedValue(null);

    // Act: Call fetchUserSettings
    const result = await fetchUserSettings('123');

    // Assert: Verify that the result is null
    expect(result).toBeNull();
  });

  it('should return null if fetchNormalUser throws an error', async () => {
    // Arrange: Mock fetchNormalUser to throw an error
    (fetchNormalUser as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Act: Call fetchUserSettings
    const result = await fetchUserSettings('123');

    // Assert: Verify that the result is null
    expect(result).toBeNull();
  });

  it('should handle edge case where accountSettings is undefined', async () => {
    // Arrange: Mock fetchNormalUser to return a user without accountSettings
    const mockUser = {};
    (fetchNormalUser as jest.Mock).mockResolvedValue(mockUser);

    // Act: Call fetchUserSettings
    const result = await fetchUserSettings('123');

    // Assert: Verify that the result is undefined
    expect(result).toBeUndefined();
  });
});

// End of unit tests for: fetchUserSettings
