
// Unit tests for: saveDataLayout


import axios from "axios";
import { saveDataLayout } from '../backendAPI';



// Mocking axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Define a mock interface to simulate the tableLayout object
interface MockObject {
  property1: string;
  property2: number;
  nestedProperty: {
    subProperty1: boolean;
  };
}

// Mock class to simulate the behavior of the tableLayout object
class MockTableLayout implements MockObject {
  public property1: string = 'default';
  public property2: number = 0;
  public nestedProperty = {
    subProperty1: true,
  };
}

describe('saveDataLayout() saveDataLayout method', () => {
  let mockTableLayout: MockTableLayout;

  beforeEach(() => {
    // Initialize the mock object before each test
    mockTableLayout = new MockTableLayout();
  });

  it('should successfully post data and return response data', async () => {
    // Arrange: Set up the mock response
    const mockResponseData = { success: true };
    mockedAxios.post.mockResolvedValue({ data: mockResponseData } as any as never);

    // Act: Call the function with mock data
    const result = await saveDataLayout('123', mockTableLayout as any);

    // Assert: Verify the function returns the expected data
    expect(result).toEqual(mockResponseData);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/club/123/save-layout',
      { tableLayout: mockTableLayout }
    );
  });

  it('should return null and log error when axios post fails', async () => {
    // Arrange: Set up the mock to reject
    const mockError = new Error('Network Error');
    mockedAxios.post.mockRejectedValue(mockError as never);

    // Act: Call the function with mock data
    const result = await saveDataLayout('123', mockTableLayout as any);

    // Assert: Verify the function returns null on error
    expect(result).toBeNull();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/club/123/save-layout',
      { tableLayout: mockTableLayout }
    );
  });

  it('should handle empty tableLayout object', async () => {
    // Arrange: Use an empty mock object
    const emptyMockTableLayout = {} as MockObject;
    const mockResponseData = { success: true };
    mockedAxios.post.mockResolvedValue({ data: mockResponseData } as any as never);

    // Act: Call the function with an empty object
    const result = await saveDataLayout('123', emptyMockTableLayout as any);

    // Assert: Verify the function handles empty objects
    expect(result).toEqual(mockResponseData);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/club/123/save-layout',
      { tableLayout: emptyMockTableLayout }
    );
  });

  it('should handle null tableLayout object', async () => {
    // Arrange: Use a null object
    const mockResponseData = { success: true };
    mockedAxios.post.mockResolvedValue({ data: mockResponseData } as any as never);

    // Act: Call the function with a null object
    const result = await saveDataLayout('123', null as any);

    // Assert: Verify the function handles null objects
    expect(result).toEqual(mockResponseData);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/club/123/save-layout',
      { tableLayout: null }
    );
  });
});

// End of unit tests for: saveDataLayout
