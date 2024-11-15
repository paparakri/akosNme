import axios from "axios";

interface Coordinates {
    lat: number | null;
    lng: number | null;
  }
  
interface GeocodeResponse {
results: {
    geometry: {
    location: {
        lat: number;
        lng: number;
    };
    };
    formatted_address: string;
}[];
status: string;
}

//EXPLORE
export const fetchSearchResults = async (searchQuery : any) => {
    return null;
}

export const fetchLists = async ( category: string ) => {
    try{
        const response = await axios.get(`http://127.0.0.1:3500/get-list/${category}`);
        console.log(response.data);
        return response.data;
    } catch (error){
        console.error("Error fetching lists:", error);
        return null;
    }
}

//TURN STRING TO LOCATION && LOCATION TO STRING
export const geocode = async (address: string) => {
    try {
        // Properly encode the address for URL usage
        const encodedAddress = encodeURIComponent(address);
        
        // Create URL with encoded parameters
        const url = `http://127.0.0.1:3500/geocode/${encodedAddress}`;
        
        // Add headers to help with Greek character handling
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };

        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        // Improved error handling with specific error types
        if (axios.isAxiosError(error)) {
            if (error.code === 'ERR_NETWORK') {
                console.error('Network error: Backend server might be down or unreachable');
            } else if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server error:', error.response.status, error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received from server');
            }
        } else {
            // Handle non-Axios errors
            console.error('Unexpected error during geocoding:', error);
        }
        
        // Re-throw the error to be handled by the calling function
        throw {
            error: true,
            message: axios.isAxiosError(error) 
                ? error.response?.data?.message || error.message 
                : 'An unexpected error occurred during geocoding',
            status: axios.isAxiosError(error) ? error.response?.status : 500
        };
    }
};

export const reverseGeocode = async (location: Coordinates) => {
    //console.log(location);
    try {
        const response = await axios.get(`http://127.0.0.1:3500/reverse-geocode/${location.lat}/${location.lng}`);
        return response.data;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw error;
    }
};

//RESERVATIONS
export const postReservation = async (reservationData: any) => {
    try {
        const response = await axios.post("http://127.0.0.1:3500/reservations", reservationData);
        return response.data;
    } catch (error) {
        console.error("Error posting reservation:", error);
        return null;
    }
}

export const updateReservation = async (reservationData: any) => {
    try {
        const response = await axios.put(`http://127.0.0.1:3500/reservations`, reservationData);
        return response.data;
    } catch (error) {
        console.error("Error updating reservation:", error);
        return null;
    }
}

export const deleteReservation = async (reservationId: string) => {
    try {
        const response = await axios.delete("http://127.0.0.1:3500/reservations", { data: { reservationId: reservationId } });
        return response.data;
    } catch (error) {
        console.error("Error deleting reservation:", error);
        return null;
    }
}

export const fetchUserReservations = async (id: string) => {
    try{
        const response = await axios.get(`http://127.0.0.1:3500/user/${id}/reservations/`);
        return response.data;
    } catch (error){
        console.error("Error fetching user reservations:", error);
        return null;
    }
}

export const fetchClubReservations = async (id: string) => {
    try{
        const response = await axios.get(`http://127.0.0.1:3500/club/${id}/reservations/`);
        return response.data;
    } catch (error){
        console.error("Error fetching club reservations:", error);
        return null;
    }
}

//CLUBS
export const fetchClubInfo = async (user: any) => {
    try {
      const response = await axios.get(`http://127.0.0.1:3500/club/${user}`, {
        headers: {
          'username': user
        }
      });
      console.log("Response Data from fetchClubInfo: ");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching club ${user} info: `, error);
      return null;
    }
}

export const fetchFeaturedClubs = async (location: Coordinates) => {
    try {
        const response = await axios.post("http://127.0.0.1:5000/featured-clubs", {
            location: location
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching featured clubs:", error);
        return null;
    }
}

export const fetchFeaturedClubsDetails = async (location: Coordinates) => {
    try {
        const featuredClubsData = await fetchFeaturedClubs(location);
        
        if (typeof featuredClubsData !== 'object' || featuredClubsData === null) {
            console.error("fetchFeaturedClubs did not return a valid object:", featuredClubsData);
            return [];
        }

        const clubUsernames = Object.values(featuredClubsData)[0];
        
        if (!Array.isArray(clubUsernames)) {
            console.error("Extracted club usernames are not an array:", clubUsernames);
            return [];
        }

        const clubDetails = await Promise.all(
            clubUsernames.map(async (clubObject: any) => {
                return fetchClubByName(clubObject.username);
            })
        );
        return clubDetails.filter(club => club !== null);
    } catch (error) {
        console.error("Error fetching featured club details:", error);
        return [];
    }
}

export const fetchClubByName = async (clubName: string) => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/club/${clubName}/byName`);
        console.log("Response Data from fetchClubInfo: ");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching club ${clubName} info: `, error);
        return null;
    }
}

export const saveDataLayout = async ( id: string, tableLayout: Object) => {
    try{
        console.log(id);
        const response = await axios.post(`http://127.0.0.1:3500/club/${id}/save-layout`, {tableLayout});
        return response.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const updateClub = async (id: string, clubData: any) => {
    try {
        const response = await axios.put(`http://127.0.0.1:3500/club/${id}`, clubData);
        console.log('Printing response from updateClub: ', response);
        return response.data;
    } catch (error) {
        console.error(`Error updating club ${id} info: `, error);
        return null;
    }
}

//USERS
export const fetchNormalUser = async (id: string) => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${id} info: `, error);
        return null;
    }
}

export const updateNormalUser = async (id: string, userData: any) => {
    try {
        const response = await axios.put(`http://127.0.0.1:3500/user/${id}`, userData);
        console.log('Printing response from updateNormalUser: ', response);
        return response.data;
    } catch (error) {
        console.error(`Error updating user ${id} info: `, error);
    }
}

export const switchUsername2Id = async (username: string) => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/user/${username}/byName`);
        console.log('Printing response from switchUsername2Id: ', response);
        return response.data._id;
    } catch (error) {
        console.error(`Error switching username to id for ${username}: `, error);
    }
}

export const fetchUserSettings = async (id: string) => {
    try{
        const user = await fetchNormalUser(id);
        return user.accountSettings;
    }catch (e) {
        console.error(e);
        return null;
    }
}

//REVIEWS
export const deleteReview = async (reviewId: string, userId: string) => {
    console.log(`review ID: ${reviewId}`)
    try {
        const response = await axios.delete(`http://127.0.0.1:3500/user/${userId}/reviews`, {data: {reviewId: reviewId}});
        
        if (response.status === 200) {
            console.log(response.data);
            return { success: true, message: response.data.message };
        } else {
            throw new Error('Failed to delete review');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error || 'An error occurred while deleting the review';
            return { success: false, message };
        } else {
            return { success: false, message: 'An unexpected error occurred' };
        }
    }
};

export const addReview = async (clubId: string, userId: string, review: any) => {
    try {
        const reviewData = {
            club: clubId,
            user: userId,
            type: "club",
            reviewText: review.reviewText,
            rating: review.rating
        };
        console.log(`!!!!!!!!!!!!!!!!Sending POST to http://127.0.0.1:3500/user/${userId}/reviews`);
        console.log(reviewData);
        const response = await axios.post(`http://127.0.0.1:3500/user/${userId}/reviews`, reviewData);
        return response.data;
    } catch (error) {
        console.error(`Error adding review to club ${userId}: `, error);
        return null;
    }
}

export const fetchReviewById = async (id: string) => {
    try {
        console.log(`Sending GET to http://127.0.0.1:3500/review/${id}`);
        const response = await axios.get(`http://127.0.0.1:3500/review/${id}`);
        console.log(`!!!!!!!!!!!!!!!!!!!!!Printing response from review/${id}: `, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching review ${id} info: `, error);
        return null;
    }
}

//Events
export const addEvent = async (clubId: string, eventData: any) => {
    try {
        console.log(`!!!!!!!!!!!!!!!!Sending POST to http://127.0.0.1:3500/club/${clubId}/events`);
        console.log(eventData);
        const response = await axios.post(`http://127.0.0.1:3500/club/${clubId}/events`, eventData);
        return response.data;
    } catch (error) { 
        console.error(`Error adding event to club ${clubId}: `, error);
        return null;
    }
}

export const getClubEvents = async (clubId: string) => {
    try{
        const response = await axios.get(`http://127.0.0.1:3500/club/${clubId}/events`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event ${clubId} info: `, error);
        return null;
    }
}

export const deleteEvent = async (clubId: string, eventId: string) => {
    try {
        const response = await axios.delete(`http://127.0.0.1:3500/club/${clubId}/events`, {data: {eventId: eventId}});
        return response.data;
    } catch (error) {
        console.error(`Error deleting event ${clubId}: `, error);
        return null;
    }
}

//IMAGE UPLOADING & DOWNLOADING
interface UploadImageResponse {
    downloadURL: string;
    fileName: string;
}

export const uploadImage = async (file: File, folder: string, fileName?: string): Promise<UploadImageResponse> => {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Make API call to your backend endpoint
        const { data } = await axios.post<UploadImageResponse>(
            `http://127.0.0.1:3500/image/upload/${folder}/${fileName || ''}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
  
export const getImage = async (fileName: string, folder: string) => {
try {
    // Make API call to your backend endpoint
    const { data } = await axios.get(`http://127.0.0.1:3500/image/${folder}/${fileName}`);
    return data.downloadURL;
} catch (error) {
    console.error('Error getting image:', error);
    throw error;
}
};

//FEED
export interface FeedActor {
    userId: string;
    userType: 'normal' | 'club' | 'serviceProvider';
    displayName: string;
    picturePath?: string;
}

export interface FeedObject {
    targetId: string;
    targetType: string;
    content: {
        reviewText?: string;
        rating?: number;
        clubName?: string;
        clubUsername?: string;
        date?: string;
        eventName?: string;
        description?: string;
        specialRequests?: string;
    };
}

export interface FeedItem {
    _id: string;
    actor: FeedActor;
    verb: 'posted_review' | 'made_reservation' | 'followed_club' | 'followed_provider' | 'upcoming_event';
    object: FeedObject;
    createdAt: string;
}

interface FeedResponse {
    feed: FeedItem[];
    hasMore: boolean;
    nextPage: number;
}

export const fetchUserFeed = async (userId: string, page: number = 1, limit: number = 20): Promise<FeedResponse | null> => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/user/${userId}/feed`, {
            params: {
                page,
                limit
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching user feed:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch feed');
        }
        throw error;
    }
};
  
export const getActivityContext = async (feedItem: FeedItem) => {
    try {
      switch (feedItem.verb) {
        case 'posted_review':
          return await fetchReviewById(feedItem.object.targetId);
        case 'made_reservation':
          // You might want to add a function to fetch reservation details
          return null;
        case 'upcoming_event':
          // Add function to fetch event details if needed
          return null;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching activity context:', error);
      return null;
    }
};

// Friend-related functions
export const sendFriendRequest = async (userId: string, secondUserId: string): Promise<void> => {
    try {
      const response = await axios.post(`http://127.0.0.1:3500/user/${userId}/friends/request/${secondUserId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      throw new Error(error.response?.data?.message || 'Failed to send friend request');
    }
};

export const acceptFriendRequest = async (userId: string, requestId: string): Promise<void> => {
    try {
      const response = await axios.put(`http://127.0.0.1:3500/user/${userId}/friends/accept/${requestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept friend request');
    }
};

export const rejectFriendRequest = async (userId: string, requestId: string): Promise<void> => {
    try {
      const response = await axios.put(`http://127.0.0.1:3500/user/${userId}/friends/reject/${requestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject friend request');
    }
};

export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
    try {
      const response = await axios.delete(`http://127.0.0.1:3500/user/${userId}/friends/${friendId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing friend:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove friend');
    }
};

interface Friend {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    picturePath?: string;
}

export const getFriends = async (userId: string): Promise<Friend[]> => {
    try {
      const response = await axios.get(`http://127.0.0.1:3500/user/${userId}/friends`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch friends');
    }
};

export const getFriendRequests = async (userId: string): Promise<Friend[]> => {
    try {
      const response = await axios.get(`http://127.0.0.1:3500/user/${userId}/friends/requests`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch friend requests');
    }
};

export const followClub = async (userId: string, clubId: string): Promise<void> => {
    try {
      const response = await axios.post(`http://127.0.0.1:3500/user/${userId}/following/clubs/${clubId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error following club:', error);
      throw new Error(error.response?.data?.message || 'Failed to follow club');
    }
};

export const unfollowClub = async (userId: string, clubId: string): Promise<void> => {
    try {
      const response = await axios.delete(`http://127.0.0.1:3500/user/${userId}/following/clubs/${clubId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error unfollowing club:', error);
      throw new Error(error.response?.data?.message || 'Failed to unfollow club');
    }
};


//SEARCH FUNCTIONS
interface SearchParams {
    searchQuery?: string;
    location?: string;
    date?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    radius?: number;
    page?: number;
    limit?: number;
}

interface SearchResponse {
    results: Array<{
        _id: string;
        username: string;
        displayName: string;
        description: string;
        location: {
            type: string;
            coordinates: [number, number];
            address: string;
        };
        formattedPrice: number;
        rating: number;
        reviews: string[];
        genres: string[];
        features: string[];
        images: string[];
        openingHours: {
            [key: string]: {
                isOpen: boolean;
                open: string;
                close: string;
            };
        };
        distance?: number;
        score?: number;
    }>;
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export const searchClubs = async (params: SearchParams): Promise<SearchResponse | null> => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add only defined parameters to query string
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await axios.get(`http://127.0.0.1:3500/search/clubs?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error searching clubs:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Search failed');
        }
        throw error;
    }
};

export const getSearchSuggestions = async (query: string): Promise<Array<{
        _id: string;
        displayName: string;
        location: {
            address: string;
        };
        score: number;
    }> | null> => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/search/suggestions`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting search suggestions:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to get suggestions');
        }
        return null;
    }
};

export const searchBars = async ({
    searchQuery = "",
    location = "",
    date = "",
    genre = "",
    minPrice,
    maxPrice,
    rating,
    radius = 5000, // Search radius in meters, default 5km
    page = 1,
    limit = 10
}: SearchParams) => {
    console.log("searching bars");
    try {
        const searchResults = await searchClubs({
            searchQuery,
            location,
            date,
            genre,
            minPrice,
            maxPrice,
            rating,
            radius,
            page,
            limit
        });

        console.log(searchResults);

        return searchResults;
    } catch (error) {
        console.error('Error searching bars:', error);
        return null;
    }
};