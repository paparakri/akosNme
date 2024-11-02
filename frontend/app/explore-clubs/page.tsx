"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Text,
  Icon,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaFire, FaGlassMartini, FaGraduationCap, FaUsers, FaHeart, FaGuitar } from "react-icons/fa";
import Link from "next/link";

import BarCard from "../ui/barCard";
import SearchBar from "../ui/searchBar";
import ResponsiveMasonryGrid from "../ui/responsiveMasonryGrid";
import { fetchLists } from "../lib/backendAPI";

interface Location {
  address?: string;
  coordinates?: [number, number];
  type?: string;
}

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: Location;
  rating: number;
  score_data: {
    [key: string]: number;
  };
  address: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: typeof FaFire;
  description: string;
}

const categories: CategoryData[] = [
  {
    id: "trending",
    name: "Trending Now",
    icon: FaFire,
    description: "Hot spots getting lots of attention right now"
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: FaGlassMartini,
    description: "High-end venues with premium experiences"
  },
  {
    id: "student_friendly",
    name: "Student Friendly",
    icon: FaGraduationCap,
    description: "Budget-friendly spots perfect for students"
  },
  {
    id: "big_groups",
    name: "Group Friendly",
    icon: FaUsers,
    description: "Ideal venues for large groups and parties"
  },
  {
    id: "date_night",
    name: "Date Night",
    icon: FaHeart,
    description: "Romantic settings for the perfect date"
  },
  {
    id: "live_music",
    name: "Live Music",
    icon: FaGuitar,
    description: "Venues featuring live performances"
  }
];

const getLocationString = (location: Location): string => {
    if (location.address) {
      return location.address;
    }
    if (location.coordinates) {
      return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return "Location unavailable";
  };

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [clubs, setClubs] = useState<BarCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        const list = await fetchLists(selectedCategory);
        // Add debug logging
        console.log('Raw API response:', list);
        
        if (list && Array.isArray(list)) {
          const sortedClubs = list.sort((a: BarCardData, b: BarCardData) => {
            const scoreA = a.score_data?.[selectedCategory] || 0;
            const scoreB = b.score_data?.[selectedCategory] || 0;
            return scoreB - scoreA;
          });
          setClubs(sortedClubs);
        } else {
          console.error("Invalid data format received from API:", list);
          setClubs([]);
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setClubs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, [selectedCategory]);

  useEffect(() => {
    if (clubs.length > 0) {
      // Method 1: Log with JSON.stringify to capture exact values at this moment
      //console.log('Clubs[0] exact snapshot:', JSON.stringify(clubs[0], null, 2));
      //console.log('Location exact snapshot:', JSON.stringify(clubs[0].location, null, 2));
  
      // Method 2: Create immediate copies
      const clubCopy = {...clubs[0]};
      const locationCopy = {...clubs[0].location};
      
      //console.log('Club copy:', clubCopy);
      //console.log('Location copy:', locationCopy);
      
      // Method 3: Log primitive values that can't change
      //console.log('Location keys:', Object.keys(clubs[0].location));
      //console.log('Location values:', Object.values(clubs[0].location));
    }
  }, [clubs]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (tabListRef.current) {
      setStartX(e.pageX - tabListRef.current.offsetLeft);
      setScrollLeft(tabListRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    if (tabListRef.current) {
      const x = e.pageX - tabListRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      tabListRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTabChange = (index: number) => {
    setSelectedCategory(categories[index].id);
    setPage(1); // Reset page when changing categories
  };

  return (
    <Box mx={{ base: "5vw", md: "10vw" }} my={8}>
      <Box mb={8}>
        <SearchBar />
      </Box>

      <Tabs variant="soft-rounded" colorScheme="orange" onChange={handleTabChange}>
        <Box
          position="relative"
          mb={6}
          sx={{
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "20px",
              zIndex: 1,
              pointerEvents: "none"
            },
            "&::before": {
              left: 0,
              background: "linear-gradient(to right, white, transparent)"
            },
            "&::after": {
              right: 0,
              background: "linear-gradient(to left, white, transparent)"
            }
          }}
        >
          <TabList 
            ref={tabListRef}
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            position="relative"
            px={2}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            sx={{
              cursor: isDragging ? "grabbing" : "grab",
              "&::-webkit-scrollbar": {
                display: "none"
              },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              flexWrap: "nowrap",
              "&::after": {
                content: '""',
                minWidth: "20px"
              },
              userSelect: "none",
              touchAction: "pan-x pinch-zoom",
            }}
          >
            {categories.map((category) => (
              <Tab 
                key={category.id}
                mr={4}
                px={6}
                py={3}
                borderRadius="full"
                flex="0 0 auto"
                _selected={{ 
                  color: "white", 
                  bg: "orange.400",
                  boxShadow: "md"
                }}
                _hover={{
                  bg: "orange.300"
                }}
                transition="all 0.2s"
              >
                <Flex align="center">
                  <Icon as={category.icon} mr={2} />
                  <Text>{category.name}</Text>
                </Flex>
              </Tab>
            ))}
          </TabList>
        </Box>

        <TabPanels>
        {categories.map((category) => (
          <TabPanel key={category.id} px={0}>
            <Box mb={8} textAlign="center">
              <Text fontSize="lg" color="gray.600">
                {category.description}
              </Text>
            </Box>

            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {[...Array(6)].map((_, i) => (
                  <Box 
                    key={i} 
                    height="300px" 
                    borderRadius="lg" 
                    bg="gray.100" 
                    animation="pulse 2s infinite"
                  />
                ))}
              </SimpleGrid>
            ) : clubs.length > 0 ? (
              <Box width="100%">
                <ResponsiveMasonryGrid>
                {clubs.slice(0, 8 * page).map((club) => (
                    <Link key={club._id} href={`/club/${club.username}`}>
                    <Box width="100%">
                        <BarCard
                        imageUrl=""
                        imageAlt=""
                        title={club.displayName}
                        description={club.description}
                        formattedPrice={club.formattedPrice}
                        reviewCount={club.reviews.length}
                        location={club.address}
                        rating={club.rating}
                        />
                    </Box>
                    </Link>
                ))}
                </ResponsiveMasonryGrid>
                
                {clubs.length > 8 * page && (
                  <Box textAlign="center" mt={8}>
                    <Button
                      bg="orange.400"
                      color="white"
                      _hover={{ bg: "orange.300" }}
                      onClick={loadMore}
                    >
                      Show More
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box 
                textAlign="center" 
                py={16} 
                px={4} 
                borderRadius="lg" 
                bg="gray.50"
              >
                <Text fontSize="lg" color="gray.600">
                  No clubs found in this category
                </Text>
              </Box>
            )}
          </TabPanel>
        ))}
      </TabPanels>
      </Tabs>
    </Box>
  );
}