import axios from "axios";

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
        const response = await axios.get(`http://127.0.0.1:3500/club/${clubName}/byName`);
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