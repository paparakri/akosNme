"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";

import BarCard from "../ui/barCard";
import SearchBar from "../ui/searchBar";
import CustomHeading from "../ui/heading";
import SplashScreen from "../ui/splashscreen";
import CallToActionWithIllustration from "../ui/callToAction";
import ResponsiveMasonryGrid from "../ui/responsiveMasonryGrid";
import { ProtectedRoute, UnprotectedRoute } from "../lib/userStatus";
import { fetchClubByName, fetchFeaturedClubs, fetchFeaturedClubsDetails } from "../lib/backendAPI";
import Link from "next/link";

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: string;
  rating: number;
}

export default function Home() {
  const [barCards, setBarCards] = useState<BarCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getBarCards = async () => {
      try {
        setIsLoading(true);
        const featuredClubs = await fetchFeaturedClubsDetails('Athens, Greece');

        // Fetch initial 4 bars
        const initialBars = await Promise.all(featuredClubs.map((club) => fetchClubByName(club.username)));
        setBarCards(initialBars.filter((info): info is BarCardData => info !== null));

      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getBarCards();
  }, []);

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
                imageUrl="" 
                imageAlt="" 
                title={card.displayName} 
                description={card.description} 
                formattedPrice={card.formattedPrice} 
                reviewCount={card.reviews.length} 
                location={card.location} 
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