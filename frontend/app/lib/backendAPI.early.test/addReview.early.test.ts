
// Unit tests for: addReview


import axios from "axios";
import { addReview } from '../backendAPI';



jest.mock("axios");

describe('addReview() addReview method', () => {
  const mockPost = axios.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully add a review and return response data', async () => {
    // Arrange: Set up the mock response
    const mockResponseData = { success: true };
    mockPost.mockResolvedValueOnce({ data: mockResponseData });

    // Act: Call the function
    const result = await addReview('club123', 'user456', { reviewText: 'Great club!', rating: 5 });

    // Assert: Verify the result and axios call
    expect(result).toEqual(mockResponseData);
    expect(mockPost).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/user/user456/reviews',
      {
        club: 'club123',
        user: 'user456',
        type: 'club',
        reviewText: 'Great club!',
        rating: 5
      }
    );
  });

  it('should return null and log an error when the request fails', async () => {
    // Arrange: Set up the mock to reject
    const mockError = new Error('Network Error');
    mockPost.mockRejectedValueOnce(mockError);

    // Act: Call the function
    const result = await addReview('club123', 'user456', { reviewText: 'Great club!', rating: 5 });

    // Assert: Verify the result and error handling
    expect(result).toBeNull();
    expect(mockPost).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/user/user456/reviews',
      {
        club: 'club123',
        user: 'user456',
        type: 'club',
        reviewText: 'Great club!',
        rating: 5
      }
    );
  });

  it('should handle missing review text gracefully', async () => {
    // Arrange: Set up the mock response
    const mockResponseData = { success: true };
    mockPost.mockResolvedValueOnce({ data: mockResponseData });

    // Act: Call the function with missing reviewText
    const result = await addReview('club123', 'user456', { rating: 4 });

    // Assert: Verify the result and axios call
    expect(result).toEqual(mockResponseData);
    expect(mockPost).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/user/user456/reviews',
      {
        club: 'club123',
        user: 'user456',
        type: 'club',
        reviewText: undefined,
        rating: 4
      }
    );
  });

  it('should handle missing rating gracefully', async () => {
    // Arrange: Set up the mock response
    const mockResponseData = { success: true };
    mockPost.mockResolvedValueOnce({ data: mockResponseData });

    // Act: Call the function with missing rating
    const result = await addReview('club123', 'user456', { reviewText: 'Nice place' });

    // Assert: Verify the result and axios call
    expect(result).toEqual(mockResponseData);
    expect(mockPost).toHaveBeenCalledWith(
      'http://127.0.0.1:3500/user/user456/reviews',
      {
        club: 'club123',
        user: 'user456',
        type: 'club',
        reviewText: 'Nice place',
        rating: undefined
      }
    );
  });
});

// End of unit tests for: addReview
