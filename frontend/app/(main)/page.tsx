"use client"

import { useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, Compass, ArrowRight } from 'lucide-react';

import EnhancedBarCard from "../ui/barCard";
import EnhancedSearchBar from "../ui/searchBar";
import EnhancedHero from "../ui/callToAction";
import MiniHero from "../ui/miniHero";
import EnhancedSplashScreen from "../ui/splashscreen";
import EnhancedMasonryGrid from "../ui/responsiveMasonryGrid";
import { ProtectedRoute, UnprotectedRoute, useIsUserSignedIn } from "../lib/userStatus";
import { fetchClubByName, fetchFeaturedClubsDetails } from "../lib/backendAPI";
import PaginatedBarCards from "../ui/paginatedBarCards";
import { useHeroStats } from "../lib/useHeroStats";
import { useViewMode } from "../lib/viewModelContext";
import ClubHomePage from "../ui/clubHomePage";

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: { address: string };
  rating: number;
  address: string;
  images: String[];
  dressCode: string;
  features: string[];
  capacity: number;
}

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export default function Home() {
  const [barCards, setBarCards] = useState<BarCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 37.983810,
    lng: 23.727539
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasSetLocation, setHasSetLocation] = useState(false);
  const { viewMode } = useViewMode();

  const { eventNumber, venueNumber, nearVenueNumber } = useHeroStats(barCards, {
    lat: coordinates.lat ?? 0,
    lng: coordinates.lng ?? 0
  });

  // Parallax and scroll effects
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end start"]
  });

  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.97]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.97]);
  
  const toast = useToast();
  const isUserSignedIn = useIsUserSignedIn();

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        
        setHasSetLocation(true);
        
        toast({
          title: "Location Updated",
          description: "Showing venues near you.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        throw new Error("Geolocation not supported");
      }
    } catch (error) {
      console.warn("Location access:", error);
      toast({
        title: "Location Access Failed",
        description: "We'll show you the best spots in the default area.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    const getBarCards = async () => {
      try {
        const featuredClubs = await fetchFeaturedClubsDetails(coordinates);
        const initialBars = await Promise.all(
          featuredClubs.map(async (club) => {
            try {
              return await fetchClubByName(club.username);
            } catch (error) {
              console.error(`Error fetching club ${club.username}:`, error);
              return null;
            }
          })
        );

        setBarCards(initialBars.filter((info): info is BarCardData => info !== null));
      } catch (error) {
        console.error("Error fetching clubs:", error);
        toast({
          title: "Couldn't Load All Venues",
          description: "We're having trouble loading some venues. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    };

    getBarCards();
  }, [coordinates, toast]);

  if (isInitialLoad) {
    return <EnhancedSplashScreen />;
  }

  if( isUserSignedIn && viewMode === "club"){
    return <ClubHomePage/>
  }

  return (
    <div className="w-full min-h-screen bg-black overflow-hidden">
      <div className="relative">
        {/* Dynamic background */}
        <div className="fixed inset-0 z-0">
          <motion.div 
            className="absolute inset-0 opacity-30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,41,190,0.1),rgba(0,0,0,0)_50%)]" />
          </motion.div>
        </div>
  
        {!isUserSignedIn && (
          <EnhancedHero />
        )}
  
        {isUserSignedIn && (
          <MiniHero
            eventNumber={isLoading ? 0 : eventNumber}
            venueNumber={isLoading ? 0 : venueNumber}
            nearVenueNumber={isLoading ? 0 : nearVenueNumber}
            hasSetLocation={hasSetLocation}
          />
        )}
        
        {/* Enhanced Search Section with Backdrop Blur */}
        <motion.div
          ref={headerRef}
          style={{ opacity: headerOpacity, scale: headerScale }}
          className={`relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 
            ${isUserSignedIn ? 'pt-20 pb-8' : '-mt-8'}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl" />
            <div className="relative p-6">
              <EnhancedSearchBar />
            </div>
          </motion.div>
        </motion.div>
  
        {/* Main Content Section */}
        <div ref={contentRef} className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative h-96 rounded-3xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
                    </motion.div>
                  ))}
                </motion.div>
              ) : barCards.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 mt-6">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Featured Venues
                      </span>
                    </h2>
                    <div className="flex items-center justify-center space-x-4 text-gray-400">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {hasSetLocation ? 'Showing featured venues near you' : 'Showing featured venues near Athens, Greece'}
                      </span>
                      {!hasSetLocation && (
                        <motion.button
                          onClick={getUserLocation}
                          disabled={isLoadingLocation}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full
                                     overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-50 blur transition duration-500" />
                          <span className="relative flex items-center space-x-2 text-white">
                            {isLoadingLocation ? (
                              <span>Updating...</span>
                            ) : (
                              <span>Use My Location</span>
                            )}
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
  
                  <PaginatedBarCards results={barCards} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                  >
                    <Compass className="w-10 h-10 text-blue-500" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Exploring New Territories
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We're currently expanding to your area. Stay tuned for an amazing collection of venues!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
    );
}