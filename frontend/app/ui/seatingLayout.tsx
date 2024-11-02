import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { Box, IconButton, HStack, useColorModeValue } from '@chakra-ui/react';
import useImage from 'use-image';
import { ZoomIn, ZoomOut } from 'lucide-react';

type Table = {
  width: number;
  height: number;
  x: number;
  y: number;
  isReserved?: boolean;
};

interface LayoutDisplayProps {
  tableList: Table[];
  containerWidth: number;
  containerHeight: number;
}

const TableImage: React.FC<{ table: Table, scale: number }> = ({ table, scale }) => {
  const [image] = useImage('/table1.png');
  
  return image && (
    <Image
      image={image}
      x={table.x * scale}
      y={table.y * scale}
      width={table.width * scale}
      height={table.height * scale}
      opacity={table.isReserved ? 0.6 : 1}
      shadowColor="#000"
      shadowBlur={3}
      shadowOpacity={0.2}
      shadowOffset={{ x: 2, y: 2 }}
    />
  );
};

const LayoutDisplay: React.FC<LayoutDisplayProps> = ({
  tableList,
  containerWidth,
  containerHeight
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: containerWidth, height: containerHeight });
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  // Handle container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      // Get the actual container dimensions
      const bounds = container.getBoundingClientRect();
      setStageSize({
        width: bounds.width,
        height: bounds.height
      });

      // Recalculate scale based on new dimensions and table positions
      if (tableList.length > 0) {
        const maxX = Math.max(...tableList.map(table => table.x + table.width));
        const maxY = Math.max(...tableList.map(table => table.y + table.height));
        const scaleX = bounds.width / maxX;
        const scaleY = bounds.height / maxY;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    // Update dimensions immediately
    updateDimensions();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [tableList, containerWidth, containerHeight]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = scale;
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const boundedScale = Math.min(Math.max(0.5, newScale), 2);

    setScale(boundedScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };
    
    setPosition(newPos);
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bg={bgColor}
      w="100%"
      h="300px" // Fixed height to ensure stability
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          scale={{ x: scale, y: scale }}
          position={position}
          draggable
          onDragEnd={(e) => setPosition(e.target.position())}
        >
          <Layer>
            {tableList.map((table, index) => (
              <TableImage
                key={index}
                table={table}
                scale={scale}
              />
            ))}
          </Layer>
        </Stage>
      )}

      <HStack
        position="absolute"
        bottom="4"
        right="4"
        spacing="2"
        zIndex={2}
      >
        <IconButton
          aria-label="Zoom in"
          icon={<ZoomIn size={18} />}
          onClick={() => setScale(s => Math.min(s * 1.1, 2))}
          size="sm"
          colorScheme="orange"
          variant="ghost"
          bg={useColorModeValue('white', 'gray.700')}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
        />
        <IconButton
          aria-label="Zoom out"
          icon={<ZoomOut size={18} />}
          onClick={() => setScale(s => Math.max(s / 1.1, 0.5))}
          size="sm"
          colorScheme="orange"
          variant="ghost"
          bg={useColorModeValue('white', 'gray.700')}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
        />
      </HStack>
    </Box>
  );
};

export default LayoutDisplay;