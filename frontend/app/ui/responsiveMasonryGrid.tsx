import { Box, Button, Flex } from '@chakra-ui/react';
import React, { useState, useEffect, useRef, ReactNode } from 'react';

const ResponsiveMasonryLayout = ({children}: Readonly<{children: ReactNode}>) => {
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newColumns = Math.floor(containerWidth / 250); // Assume minimum column width of 250px
        setColumns(Math.max(1, Math.min(4, newColumns))); // Limit to between 1 and 4 columns
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

  return (
    <div className="p-4" ref={containerRef}>
      <div className="flex flex-wrap">
      <Box
            borderWidth='1px'
            borderRadius='50'
            bg="white"
            _dark={{
              bg: "#3e3e3e",
            }}
            p={50}
            w="full"
            alignItems="center"
            justifyContent="center"
          >
          <Flex>
            {getColumns().map((column, columnIndex) => (
              <div key={columnIndex} className="flex-grow" style={{ width: `${100 / columns}%` }}>
                {column}
              </div>
            ))}
          </Flex>
        </Box>
      </div>
    </div>
  );
};

export default ResponsiveMasonryLayout;