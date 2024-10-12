import axios from "axios";

export const fetchSearchResults = async (searchQuery : any) => {
    return null;
}

export const fetchClubInfo = async (user: any) => {
    try {
      const response = await axios.get(`http://127.0.0.1:3500/club/${user}`, {
        headers: {
          'username': user
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching club ${user} info: `, error);
      return null;
    }
}

export const fetchFeaturedClubs = async (location: string) => {
    try {
        const response = await axios.post("http://127.0.0.1:5000/featured-clubs", {
            location: location
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching featured clubs:", error);
        return null;
    }
}

export const fetchFeaturedClubsDetails = async (location: string) => {
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
        console.log(`Sending GET to the following link: http://127.0.0.1:3500/club/${clubName}/byName`);
        const response = await axios.get(`http://127.0.0.1:3500/club/${clubName}/byName`);
        console.log("!!!!!!!!!!Printing response from fetchClubByName: ", response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching club ${clubName} info: `, error);
        return null;
    }
}

export const fetchNormalUser = async (id: string) => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/user/${id}`);
        return response.data;
    } catch (error) {
        //console.error(`Error fetching user ${username} info: `, error);
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

export const addRemoveReview = async (clubId: string, userId: string, review: any) => {
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

export const switchUsername2Id = async (username: string) => {
    try {
        const response = await axios.get(`http://127.0.0.1:3500/user/${username}/byName`);
        console.log('Printing response from switchUsername2Id: ', response);
        return response.data._id;
    } catch (error) {
        console.error(`Error switching username to id for ${username}: `, error);
    }
}