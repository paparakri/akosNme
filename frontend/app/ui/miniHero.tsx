import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, MapPin } from 'lucide-react';

const MiniHero = () => {
  return (
    <div className="pt-28">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-black/30 to-blue-900/10 backdrop-blur-xl rounded-3xl" />
        
        {/* Border glow effects */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        {/* Content */}
        <div className="relative px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Welcome Message */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center md:text-left"
            >
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  This Weekend's Hottest Spots
                </span>
              </h1>
              <p className="text-gray-400 max-w-xl">
                Discover exclusive venues and unforgettable experiences in your area.
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { 
                  icon: Sparkles, 
                  label: "Featured Events", 
                  value: "6",
                  gradient: "from-orange-400 to-pink-500" 
                },
                { 
                  icon: Clock, 
                  label: "Clubs Open", 
                  value: "28",
                  gradient: "from-blue-400 to-purple-500"
                },
                { 
                  icon: MapPin, 
                  label: "Near You", 
                  value: "14",
                  gradient: "from-purple-400 to-blue-500"
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 
                           hover:border-white/20 transition-colors duration-300 relative group"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MiniHero;