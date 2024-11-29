// LayoutManager.tsx
import React, { useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from './layoutStore';
import { Toolbar } from './toolbar';
import { ElementSidebar } from './elementSidebar';
import { ElementProperties } from './elementProperties';
import { Grid } from './grid';
import { Guides } from './guides';
import { Element } from './layoutElements';

const LayoutManager: React.FC<{ id: string; onSave?: (layout: any) => void }> = ({ 
  id, 
  onSave 
}) => {
  const {
    elements,
    selectedIds,
    grid,
    viewport,
    guides,
    activeTool,
    setSelectedIds,
    updateElement,
    loadLayout,
    setScale,
    setPosition
  } = useLayoutStore();

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.deltaY > 0 ? viewport.scale / scaleBy : viewport.scale * scaleBy;
    setScale(Math.min(Math.max(0.1, newScale), 5));
  }, [viewport.scale, setScale]);

  return (
    <div className="relative w-full h-[calc(100vh-100px)] bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {/* Background patterns/effects */}
        <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
      </div>

      {/* Canvas Area - Notice the pointer-events-auto */}
      <div className="absolute inset-0 overflow-hidden" onWheel={handleWheel}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight - 100}
          onClick={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedIds([]);
            }
          }}
          scale={{ x: viewport.scale, y: viewport.scale }}
          position={viewport.position}
          draggable={activeTool === 'select'}
          onDragEnd={(e) => {
            setPosition(e.currentTarget.position());
          }}
        >
          <Layer>
            {grid.enabled && (
              <Grid
                width={window.innerWidth * 2}
                height={window.innerHeight * 2}
                size={grid.size}
                subdivisions={grid.subdivisions}
              />
            )}

            {guides.length > 0 && (
              <Guides
                guides={guides}
                canvasWidth={window.innerWidth}
                canvasHeight={window.innerHeight - 100}
              />
            )}

            {elements.map((element) => (
              <Element
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                onSelect={() => {
                  const isShiftPressed = window.event?.shiftKey;
                  if (isShiftPressed) {
                    setSelectedIds([...selectedIds, element.id]);
                  } else {
                    setSelectedIds([element.id]);
                  }
                }}
                onChange={(updates) => updateElement(element.id, updates)}
                onDragStart={() => {}}
                onDragEnd={() => {}}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* UI Layer - All UI elements here, above the canvas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {/* Toolbar - pointer-events-auto to make it clickable */}
          <div className="pointer-events-auto">
            <Toolbar />
          </div>

          {/* Element Sidebar */}
          <div className="pointer-events-auto">
            <ElementSidebar />
          </div>

          {/* Properties Panel */}
          <AnimatePresence>
            {selectedIds.length === 1 && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="absolute top-20 right-4 w-80 pointer-events-auto"
              >
                <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 overflow-y-auto max-h-[calc(100vh-32px)]">
                  <ElementProperties
                    element={elements.find(el => el.id === selectedIds[0])!}
                    onChange={(updates) => updateElement(selectedIds[0], updates)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          {onSave && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave({ elements, grid, viewport })}
              className="absolute bottom-4 right-4 px-6 py-3 rounded-xl
                        bg-gradient-to-r from-blue-500 to-blue-600
                        text-white font-medium shadow-lg hover:shadow-blue-500/25
                        transition-shadow duration-300 pointer-events-auto"
            >
              Save Layout
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutManager;