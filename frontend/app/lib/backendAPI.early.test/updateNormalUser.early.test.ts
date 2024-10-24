
// Unit tests for: updateNormalUser


import axios from "axios";
import { updateNormalUser } from '../backendAPI';



jest.mock("axios");

describe('updateNormalUser() updateNormalUser method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully update a user and return response data', async () => {
        // Arrange
        const mockId = '123';
        const mockUserData = { name: 'John Doe', email: 'john.doe@example.com' };
        const mockResponse = { data: { success: true, user: mockUserData } };
        
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await updateNormalUser(mockId, mockUserData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${mockId}`, mockUserData);
        expect(result).toEqual(mockResponse.data);
    });

    it('should handle an error when the update fails', async () => {
        // Arrange
        const mockId = '123';
        const mockUserData = { name: 'John Doe', email: 'john.doe@example.com' };
        const mockError = new Error('Network Error');
        
        (axios.put as jest.Mock).mockRejectedValue(mockError);

        // Act
        const result = await updateNormalUser(mockId, mockUserData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${mockId}`, mockUserData);
        expect(result).toBeUndefined();
    });

    it('should handle an empty userData object', async () => {
        // Arrange
        const mockId = '123';
        const mockUserData = {};
        const mockResponse = { data: { success: true, user: mockUserData } };
        
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await updateNormalUser(mockId, mockUserData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${mockId}`, mockUserData);
        expect(result).toEqual(mockResponse.data);
    });

    it('should handle a non-string id', async () => {
        // Arrange
        const mockId = 123; // Non-string id
        const mockUserData = { name: 'John Doe', email: 'john.doe@example.com' };
        const mockResponse = { data: { success: true, user: mockUserData } };
        
        (axios.put as jest.Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await updateNormalUser(mockId as any, mockUserData);

        // Assert
        expect(axios.put).toHaveBeenCalledWith(`http://127.0.0.1:3500/user/${mockId}`, mockUserData);
        expect(result).toEqual(mockResponse.data);
    });
});

// End of unit tests for: updateNormalUser
