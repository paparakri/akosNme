
// Unit tests for: deleteReview


import axios from "axios";
import { deleteReview } from '../backendAPI';



jest.mock("axios");

describe('deleteReview() deleteReview method', () => {
    const reviewId = '12345';
    const userId = 'user123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return success when the review is deleted successfully', async () => {
        // Arrange: Mock axios to simulate a successful deletion
        (axios.delete as jest.Mock).mockResolvedValue({
            status: 200,
            data: { message: 'Review deleted successfully' }
        });

        // Act: Call the deleteReview function
        const result = await deleteReview(reviewId, userId);

        // Assert: Verify the result is successful
        expect(result).toEqual({ success: true, message: 'Review deleted successfully' });
        expect(axios.delete).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${userId}/reviews`, { data: { reviewId } });
    });

    it('should return failure when the server responds with a non-200 status', async () => {
        // Arrange: Mock axios to simulate a failed deletion
        (axios.delete as jest.Mock).mockResolvedValue({
            status: 400,
            data: { message: 'Failed to delete review' }
        });

        // Act: Call the deleteReview function
        const result = await deleteReview(reviewId, userId);

        // Assert: Verify the result indicates failure
        expect(result).toEqual({ success: false, message: 'Failed to delete review' });
    });

    it('should return failure with a specific error message when axios throws an error with a response', async () => {
        // Arrange: Mock axios to simulate an error with a response
        (axios.delete as jest.Mock).mockRejectedValue({
            response: {
                data: { error: 'Review not found' }
            }
        });

        // Act: Call the deleteReview function
        const result = await deleteReview(reviewId, userId);

        // Assert: Verify the result indicates failure with the specific error message
        expect(result).toEqual({ success: false, message: 'Review not found' });
    });

    it('should return failure with a generic error message when axios throws an error without a response', async () => {
        // Arrange: Mock axios to simulate an error without a response
        (axios.delete as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Act: Call the deleteReview function
        const result = await deleteReview(reviewId, userId);

        // Assert: Verify the result indicates failure with a generic error message
        expect(result).toEqual({ success: false, message: 'An error occurred while deleting the review' });
    });

    it('should return failure with a generic error message when a non-axios error is thrown', async () => {
        // Arrange: Mock axios to simulate a non-axios error
        (axios.delete as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        // Act: Call the deleteReview function
        const result = await deleteReview(reviewId, userId);

        // Assert: Verify the result indicates failure with a generic error message
        expect(result).toEqual({ success: false, message: 'An unexpected error occurred' });
    });
});

// End of unit tests for: deleteReview
