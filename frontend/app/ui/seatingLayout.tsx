import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const TableImage: React.FC<{ table: Table; scale: number }> = ({ table, scale }) => {
  const [image] = useImage('/table1.png');
  
  return image && (
    <Image
      image={image}
      x={table.x * scale}
      y={table.y * scale}
      width={table.width * scale}
      height={table.height * scale}
      opacity={table.isReserved ? 0.5 : 1}
      shadowColor="#000"
      shadowBlur={6}
      shadowOpacity={0.3}
      shadowOffset={{ x: 3, y: 3 }}
      filters={table.isReserved ? [Konva.Filters.Blur] : []}
      blurRadius={table.isReserved ? 1 : 0}
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

  // Handle container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      setStageSize({
        width: bounds.width,
        height: bounds.height
      });

      if (tableList.length > 0) {
        const maxX = Math.max(...tableList.map(table => table.x + table.width));
        const maxY = Math.max(...tableList.map(table => table.y + table.height));
        const scaleX = bounds.width / maxX;
        const scaleY = bounds.height / maxY;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    updateDimensions();

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
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[300px] overflow-hidden
                 bg-gradient-to-br from-black/80 to-black/95 backdrop-blur-xl
                 border border-white/10 rounded-xl shadow-2xl"
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                           linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: `${20 * scale}px ${20 * scale}px`
        }}
      />

      {/* Glow Effects */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

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

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-4 right-4 flex items-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScale(s => Math.min(s * 1.1, 2))}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80
                     hover:bg-white/20 hover:text-white transition-all duration-300"
        >
          <ZoomIn size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScale(s => Math.max(s / 1.1, 0.5))}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80
                     hover:bg-white/20 hover:text-white transition-all duration-300"
        >
          <ZoomOut size={18} />
        </motion.button>
      </motion.div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm
                    border border-white/10 text-white/70 text-sm">
        {Math.round(scale * 100)}%
      </div>
    </motion.div>
  );
};

export default LayoutDisplay;