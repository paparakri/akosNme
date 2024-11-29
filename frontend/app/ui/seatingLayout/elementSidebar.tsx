// ElementSidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { elementTemplates } from './elementTemplates';
import { useLayoutStore } from './layoutStore';

export const ElementSidebar = () => {
  const addElement = useLayoutStore(state => state.addElement);

  const handleAddElement = (type: string) => {
    // Add element to center of viewport initially
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Adding element:', type);
    addElement(type, {
      x: window.innerWidth / 2 - elementTemplates[type].defaultWidth / 2,
      y: window.innerHeight / 2 - elementTemplates[type].defaultHeight / 2
    });
  };

  return (
    <div className="absolute left-4 top-20 w-64 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Add Elements</h3>
      <div className="space-y-2">
        {Object.entries(elementTemplates).map(([type, template]) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAddElement(type)}
            className="w-full flex items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 
                     border border-white/10 transition-all group"
          >
            <span className="w-8 h-8 flex items-center justify-center text-xl">
              {template.icon}
            </span>
            <span className="ml-3 text-white/80 group-hover:text-white">
              {template.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};