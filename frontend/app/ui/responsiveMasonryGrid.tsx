import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BarCard from './barCard';

const ResponsiveMasonryLayout = ({results}: Readonly<{results: any[]}>) => {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoaded(true);
    const updateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let newColumns;
        if (containerWidth < 640) newColumns = 1; // mobile
        else if (containerWidth < 768) newColumns = 2; // tablet
        else if (containerWidth < 1024) newColumns = 3; // small desktop
        else newColumns = 3; // large desktop
        setColumns(newColumns);
      }
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const getColumns = () => {
    const cols = Array.from({ length: columns }, () => [] as ReactNode[]);
    results.forEach((club, index) => {
      cols[index % columns].push(
        <Link key={club._id} href={`/club/${club.username}`}>
          <BarCard
            openingHours={club.openingHours}
            _id={club._id}
            imageUrl={club.images ? club.images[0]?.toString() : '/default-club.jpeg'}
            imageAlt={club.displayName}
            title={club.displayName}
            description={club.description}
            formattedPrice={club.formattedPrice}
            reviewCount={club.reviews?.length}
            location={club.address}
            rating={club.rating}
            username={club.username}
            features={[]}
            capacity={0}
            dressCode={''}
            selectedDate={searchParams.get('date') || undefined}
            onDateSelect={(date) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('date', date.toISOString().split('T')[0]);
              router.push(`/search?${params.toString()}`);
            }}
          />
        </Link>
      );
    });
    return cols;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative p-4"
    >
      {results.length > 0 ? (
        <motion.div
          className="relative grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`
          }}
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {getColumns().map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((child, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="transform transition-all duration-300 hover:scale-102"
                >
                  {child}
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No results found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveMasonryLayout;