import { motion } from 'framer-motion';
import { Building2, User } from 'lucide-react';
import { useViewMode } from '@/app/lib/viewModelContext';

export default function ViewModeToggle() {
  const { viewMode, toggleViewMode, isClub } = useViewMode();

  console.log("Inside ViewModeToggle.tsx with the above info: ", viewMode, toggleViewMode, isClub);

  if (!viewMode) return null;


  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleViewMode}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 
                hover:bg-white/10 transition-colors border border-white/10"
    >
      {viewMode === 'club' ? (
        <>
          <Building2 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">Club</span>
        </>
      ) : (
        <>
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Guest</span>
        </>
      )}
    </motion.button>
  );
}