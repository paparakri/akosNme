"use client"

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  FaFire, FaGlassMartini, FaGraduationCap, FaUsers,
  FaHeart, FaGuitar, FaSearch, FaCompass
} from "react-icons/fa";
import BarCard from "../ui/barCard";
import SearchBar from "../ui/searchBar";
import ResponsiveMasonryGrid from "../ui/responsiveMasonryGrid";
import { fetchLists } from "../lib/backendAPI";

const categories = [
  {
    id: "trending",
    name: "Trending Now",
    icon: FaFire,
    description: "Hot spots getting lots of attention right now",
    gradient: "from-blue-500 to-pink-500",
    pattern: "radial-gradient(circle at 20% 110%, rgba(255, 122, 0, 0.15), transparent 50%)"
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: FaGlassMartini,
    description: "High-end venues with premium experiences",
    gradient: "from-purple-500 to-indigo-500",
    pattern: "radial-gradient(circle at 80% -10%, rgba(147, 51, 234, 0.15), transparent 50%)"
  },
  {
    id: "student_friendly",
    name: "Student Friendly",
    icon: FaGraduationCap,
    description: "Budget-friendly spots perfect for students",
    gradient: "from-green-500 to-teal-500",
    pattern: "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15), transparent 50%)"
  },
  {
    id: "big_groups",
    name: "Group Friendly",
    icon: FaUsers,
    description: "Ideal venues for large groups and parties",
    gradient: "from-blue-500 to-cyan-500",
    pattern: "radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.15), transparent 50%)"
  },
  {
    id: "date_night",
    name: "Date Night",
    icon: FaHeart,
    description: "Romantic settings for the perfect date",
    gradient: "from-red-500 to-pink-500",
    pattern: "radial-gradient(circle at 50% -50%, rgba(244, 63, 94, 0.15), transparent 50%)"
  },
  {
    id: "live_music",
    name: "Live Music",
    icon: FaGuitar,
    description: "Venues featuring live performances",
    gradient: "from-yellow-500 to-blue-500",
    pattern: "radial-gradient(circle at 120% 50%, rgba(234, 179, 8, 0.15), transparent 50%)"
  }
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);

  const headerRef = useRef(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.98]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        const list = await fetchLists(selectedCategory);
        if (list && Array.isArray(list)) {
          const sortedClubs = list.sort((a, b) => {
            const scoreA = a.score_data?.[selectedCategory] || 0;
            const scoreB = b.score_data?.[selectedCategory] || 0;
            return scoreB - scoreA;
          });
          setClubs(sortedClubs);
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

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Sophisticated progress bar with glow effect */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/10 dark:bg-white/10 z-50">
        <motion.div 
          className="h-full relative"
          style={{ 
            width: `${scrollProgress}%`,
            background: `linear-gradient(to right, ${selectedCategoryData.gradient.split(' ')[1]}, ${selectedCategoryData.gradient.split(' ')[3]})` 
          }}
        >
          <div className="absolute top-0 right-0 w-4 h-full blur-sm" 
            style={{ 
              background: `linear-gradient(to right, ${selectedCategoryData.gradient.split(' ')[1]}, ${selectedCategoryData.gradient.split(' ')[3]})` 
            }} 
          />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section with Dynamic Background */}
        <motion.div 
          ref={headerRef}
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="relative mb-16"
        >
          <div className="absolute inset-0" style={{ background: selectedCategoryData.pattern }} />
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Discover Your
                </span>
                <br />
                <span className={`bg-gradient-to-r ${selectedCategoryData.gradient} bg-clip-text text-transparent`}>
                  Perfect Venue
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Explore Athens' finest nightlife spots, from trendy bars to exclusive clubs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SearchBar />
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Categories Section */}
        <div className="mb-16">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300
                  ${selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg` 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-md'
                  }`}
              >
                <div className="absolute inset-0 opacity-20" style={{ background: category.pattern }} />
                <div className="relative z-10 flex flex-col items-center space-y-2">
                  <category.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Category Description with Dynamic Background */}
        <motion.div 
          className="relative mb-16 p-8 rounded-2xl overflow-hidden"
          style={{ background: selectedCategoryData.pattern }}
        >
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <h2 className="text-2xl font-bold mb-2">
              <span className={`bg-gradient-to-r ${selectedCategoryData.gradient} bg-clip-text text-transparent`}>
                {selectedCategoryData.name}
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedCategoryData.description}
            </p>
          </motion.div>
        </motion.div>

        {/* Venues Grid with Enhanced Loading State */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative overflow-hidden rounded-xl h-96"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              ))}
            </motion.div>
          ) : clubs.length > 0 ? (
            <ResponsiveMasonryGrid>
              {clubs.slice(0, 8 * page).map((club, index) => (
                <motion.div
                  key={club._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setHoveredCard(club._id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <Link href={`/club/${club.username}`}>
                    <div className="transform transition-all duration-300">
                      <BarCard
                        username={club.username}
                        imageUrl={club.images ? club.images[0].toString() : '/default-club.jpeg'}
                        imageAlt={club.displayName}
                        title={club.displayName}
                        description={club.description}
                        formattedPrice={club.formattedPrice}
                        reviewCount={club.reviews.length}
                        location={club.address}
                        rating={club.rating}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </ResponsiveMasonryGrid>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <FaCompass className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No venues found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or exploring different categories
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Load More Button */}
        {clubs.length > 8 * page && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => setPage(p => p + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 bg-gradient-to-r ${selectedCategoryData.gradient} text-white rounded-full
                       shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <span className="flex items-center space-x-2">
                <span>Discover More Venues</span>
                <FaCompass className="w-4 h-4 animate-pulse" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}