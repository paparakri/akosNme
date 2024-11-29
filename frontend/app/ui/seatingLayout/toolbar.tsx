import React from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, Grid3X3, Lock, Unlock, ZoomIn, ZoomOut,
  Layers, AlignCenter, Ruler, Undo, Redo, Save, Plus,
  Copy, Trash2, Focus
} from 'lucide-react';
import { useLayoutStore } from './layoutStore';

interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive,
  disabled
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg
      transition-all duration-200 relative group
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'text-white/70 hover:bg-white/10'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
    
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none">
      <div className="bg-black/90 text-white text-xs px-2 py-1 rounded">
        {label}
      </div>
    </div>
  </motion.button>
);

export const Toolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    grid,
    toggleGrid,
    toggleSnap,
    undo,
    redo,
    history,
    clearSelection,
    selectedIds,
    deleteElement,
    duplicateElement,
    resetView
  } = useLayoutStore();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2
                    bg-black/40 backdrop-blur-xl rounded-xl border border-white/10
                    p-2 space-x-1 flex items-center">
      {/* Tools Group */}
      <div className="space-x-1 flex items-center">
        <ToolButton
          icon={MousePointer2}
          label="Select"
          onClick={() => setActiveTool('select')}
          isActive={activeTool === 'select'}
        />
        <ToolButton
          icon={Ruler}
          label="Measure"
          onClick={() => setActiveTool('measure')}
          isActive={activeTool === 'measure'}
        />
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* View Controls */}
      <div className="space-x-1 flex items-center">
        <ToolButton
          icon={Grid3X3}
          label="Toggle Grid"
          onClick={toggleGrid}
          isActive={grid.enabled}
        />
        <ToolButton
          icon={Layers}
          label="Snap to Grid"
          onClick={toggleSnap}
          isActive={grid.snap}
        />
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* History Controls */}
      <div className="space-x-1 flex items-center">
        <ToolButton
          icon={Undo}
          label="Undo"
          onClick={undo}
          disabled={!canUndo}
        />
        <ToolButton
          icon={Redo}
          label="Redo"
          onClick={redo}
          disabled={!canRedo}
        />
      </div>

      {/* Selection Controls */}
      {hasSelection && (
        <>
          <div className="w-px h-8 bg-white/10" />
          <div className="space-x-1 flex items-center">
            <ToolButton
              icon={Copy}
              label="Duplicate"
              onClick={() => selectedIds.forEach(duplicateElement)}
            />
            <ToolButton
              icon={Trash2}
              label="Delete"
              onClick={() => {
                selectedIds.forEach(deleteElement);
                clearSelection();
              }}
            />
          </div>
        </>
      )}

      <div className="w-px h-8 bg-white/10" />

      {/* View Controls */}
      <div className="space-x-1 flex items-center">
        <ToolButton
          icon={Focus}
          label="Reset View"
          onClick={resetView}
        />
      </div>
    </div>
  );
};