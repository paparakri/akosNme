import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import EnhancedMasonryGrid from './responsiveMasonryGrid';

const CARDS_PER_PAGE = 6;

interface PaginatedBarCardsProps {
  results: any[];
}

const PaginatedBarCards: React.FC<PaginatedBarCardsProps> = ({ results }) => {
  const [displayedCards, setDisplayedCards] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Reset state when results change
    setDisplayedCards(results.slice(0, CARDS_PER_PAGE));
    setPage(1);
    setHasMore(results.length > CARDS_PER_PAGE);
  }, [results]);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = 0; // We always start from 0 since EnhancedMasonryGrid handles the full set
    const endIndex = nextPage * CARDS_PER_PAGE;
    
    const newCards = results.slice(startIndex, endIndex);
    setDisplayedCards(newCards);
    setPage(nextPage);
    setHasMore(endIndex < results.length);
  };

  return (
    <>
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
        <EnhancedMasonryGrid results={displayedCards} />
      </motion.div>

      {hasMore ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mt-16"
        >
          <motion.button
            onClick={loadMore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full
                     overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 
                         group-hover:opacity-50 blur transition duration-500" />
            <span className="relative flex items-center space-x-2 text-white">
              <span>Discover More Venues</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </motion.button>
        </motion.div>
      ):(
        <div className="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
          Showing <span className="text-white">{displayedCards.length}/{displayedCards.length}</span> Clubs
        </div>
      )}
    </>
  );
};

export default PaginatedBarCards;