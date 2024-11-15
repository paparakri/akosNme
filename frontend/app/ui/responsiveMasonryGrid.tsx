import { Box, Button, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, ReactNode } from 'react';

const ResponsiveMasonryLayout = ({children}: Readonly<{children: ReactNode}>) => {
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const updateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let newColumns;
        if (containerWidth < 640) newColumns = 1; // mobile
        else if (containerWidth < 768) newColumns = 2; // tablet
        else if (containerWidth < 1024) newColumns = 3; // small desktop
        else newColumns = 4; // large desktop
        setColumns(newColumns);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const getColumns = () => {
    const childrenArray = React.Children.toArray(children);
    const cols = Array.from({ length: columns }, () => [] as ReactNode[]);
    childrenArray.forEach((child, index) => {
      cols[index % columns].push(child);
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
      {/* Background Elements */}
      <div className="absolute inset-0 bg-transparent" />
      
      <motion.div 
        className="relative grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`
        }}
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {getColumns().map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
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

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
    </div>
  );
};

export default ResponsiveMasonryLayout;