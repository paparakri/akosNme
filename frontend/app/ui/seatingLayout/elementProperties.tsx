import React from 'react';
import { motion } from 'framer-motion';
import { elementTemplates } from './elementTemplates';
import type { LayoutElement } from './types';
import { Unlock, Lock } from 'lucide-react';

interface ElementPropertiesProps {
  element: LayoutElement;
  onChange: (updates: Partial<LayoutElement>) => void;
}

export const ElementProperties: React.FC<ElementPropertiesProps> = ({
  element,
  onChange
}) => {
  const template = elementTemplates[element.type];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {template.label} Properties
        </h3>
      </div>

      {/* Basic Properties */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Name
          </label>
          <input
            type="text"
            value={element.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-white placeholder-white/30 focus:outline-none focus:ring-2
                     focus:ring-blue-500/50"
          />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onChange({ x: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onChange({ y: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Width
            </label>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onChange({ width: Number(e.target.value) })}
              min={template.minWidth}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Height
            </label>
            <input
              // ElementProperties.tsx (continued)
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onChange({ height: Number(e.target.value) })}
              min={template.minHeight}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Rotation */}
        {template.allowRotate && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Rotation
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="360"
                value={element.rotation || 0}
                onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={Math.round(element.rotation || 0)}
                onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2
                         text-white placeholder-white/30 focus:outline-none focus:ring-2
                         focus:ring-blue-500/50"
              />
            </div>
          </div>
        )}

        {/* Capacity (for tables and booths) */}
        {(element.type === 'table' || element.type === 'booth') && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={element.capacity || 0}
              onChange={(e) => onChange({ capacity: Number(e.target.value) })}
              min={1}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            />
          </div>
        )}

        {/* Element-specific properties */}
        {element.type === 'bar' && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Service Side
            </label>
            <select
              value={element.customProps?.serviceSide || 'front'}
              onChange={(e) => onChange({ 
                customProps: { 
                  ...element.customProps, 
                  serviceSide: e.target.value 
                } 
              })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            >
              <option value="front">Front</option>
              <option value="back">Back</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="all">All Sides</option>
            </select>
          </div>
        )}

        {element.type === 'stage' && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Stage Type
            </label>
            <select
              value={element.customProps?.stageType || 'main'}
              onChange={(e) => onChange({ 
                customProps: { 
                  ...element.customProps, 
                  stageType: e.target.value 
                } 
              })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-white placeholder-white/30 focus:outline-none focus:ring-2
                       focus:ring-blue-500/50"
            >
              <option value="main">Main Stage</option>
              <option value="dj">DJ Booth</option>
              <option value="performance">Performance Area</option>
            </select>
          </div>
        )}

        {/* Style Properties */}
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-2">Style</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Fill Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={element.style?.fill || template.style.fill}
                  onChange={(e) => onChange({ 
                    style: { 
                      ...element.style, 
                      fill: e.target.value 
                    } 
                  })}
                  className="w-full h-8 rounded cursor-pointer"
                />
                <button
                  onClick={() => onChange({ 
                    style: { 
                      ...element.style, 
                      fill: template.style.fill 
                    } 
                  })}
                  className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20"
                >
                  Reset
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Border Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={element.style?.stroke || template.style.stroke}
                  onChange={(e) => onChange({ 
                    style: { 
                      ...element.style, 
                      stroke: e.target.value 
                    } 
                  })}
                  className="w-full h-8 rounded cursor-pointer"
                />
                <button
                  onClick={() => onChange({ 
                    style: { 
                      ...element.style, 
                      stroke: template.style.stroke 
                    } 
                  })}
                  className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock/Unlock */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => onChange({ isLocked: !element.isLocked })}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2
                     transition-colors ${
                       element.isLocked
                         ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                         : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                     }`}
        >
          {element.isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Unlock Element</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Lock Element</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

                