"use client";
import { useEffect, useState } from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import Link from "next/link";

import BarCard from "../ui/barCard";
import SearchBar from "../ui/searchBar";
import CustomHeading from "../ui/heading";
import SplashScreen from "../ui/splashscreen";
import CallToActionWithIllustration from "../ui/callToAction";
import ResponsiveMasonryGrid from "../ui/responsiveMasonryGrid";
import { UnprotectedRoute } from "../lib/userStatus";
import { fetchClubByName, fetchFeaturedClubsDetails } from "../lib/backendAPI";

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: {
    address: string;
  };
  rating: number;
  address: string;
  images: String[];
}

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export default function Home() {
  const [barCards, setBarCards] = useState<BarCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 37.983810,
    lng: 23.727539
  });
  const toast = useToast();

  useEffect(() => {
    // Get user's location
    const getUserLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location Error",
              description: "Unable to get your location. Showing default results.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        toast({
          title: "Location Not Supported",
          description: "Your browser doesn't support location services. Showing default results.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    getUserLocation();
  }, [toast]);

  useEffect(() => {
    const getBarCards = async () => {
      try {
        setIsLoading(true);
        const featuredClubs = await fetchFeaturedClubsDetails(coordinates);
        const initialBars = await Promise.all(featuredClubs.map((club) => fetchClubByName(club.username)));
        setBarCards(initialBars.filter((info): info is BarCardData => info !== null));
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getBarCards();
  }, [coordinates]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (isLoading) {
    return <SplashScreen/>;
  }

  return (
    <div>
      <div style={{marginLeft:"10vw", marginRight:"10vw"}}>
        <UnprotectedRoute>
          <CallToActionWithIllustration/>
        </UnprotectedRoute>
        <div style={{paddingTop:'4vh', marginLeft:"10vw", marginRight:"10vw", marginBottom:'4vh'}}>
          <SearchBar />
        </div>
        {barCards.length > 0 ? (
        <>
          <CustomHeading>Featured Clubs</CustomHeading>
          <ResponsiveMasonryGrid>
            {barCards.slice(0, 8*page).map((card) => (
              <Link key={card._id.toString()} href={`/club/${card.username}`}>
                <BarCard 
                  key={card._id.toString()}
                  imageUrl={card.images ? card.images[0] : ''} 
                  imageAlt="" 
                  title={card.displayName} 
                  description={card.description} 
                  formattedPrice={card.formattedPrice} 
                  reviewCount={card.reviews.length} 
                  location={card.address} // Access the address string from the location object
                  rating={card.rating}
                />
              </Link>
            ))}
          </ResponsiveMasonryGrid>
          <Box textAlign='center' pb={4}>
            <Button bg="orange.400" margin={3} onClick={loadMore} _hover={{bg:"orange.300"}}>
              Show More
            </Button>
          </Box>
        </>
      ) : (
        <div>No bar cards available</div>
      )}
      </div>
    </div>
  );
}