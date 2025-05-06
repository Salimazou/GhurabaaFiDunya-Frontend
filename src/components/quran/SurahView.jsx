import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PlayIcon,
  PauseIcon,
  BookmarkIcon,
  ChevronDoubleUpIcon,
  ShareIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const SurahView = ({ 
  surah, 
  onBack, 
  onPlay, 
  isMarkedForMemorization, 
  onToggleMemorization,
  isPlaying
}) => {
  const [currentAyah, setCurrentAyah] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position to show/hide scroll-to-top button
  const handleScroll = (e) => {
    setShowScrollTop(e.target.scrollTop > 300);
  };

  // Scroll to top
  const scrollToTop = () => {
    const contentDiv = document.getElementById('surah-content');
    if (contentDiv) {
      contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  if (!surah || !surah.ayahs) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Surah header with beautiful styling */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 md:p-8 relative overflow-hidden">
        {/* Decorative pattern in background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0h20v20H0zm20 20h20v20H20z" fill="currentColor" />
              <path d="M0 20h20v20H0zm20-20h20v20H20z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <ShareIcon className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-center relative">
          <div className="mb-1">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/20 text-white text-xl font-bold">
              {surah.number}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-1">{surah.englishName}</h1>
          <p className="text-emerald-100 text-lg">{surah.englishNameTranslation}</p>
          <p className="text-emerald-100 text-sm mt-2">
            {surah.revelationType} • {surah.numberOfAyahs} Ayahs
          </p>
          
          <div className="flex justify-center space-x-3 mt-6">
            <button
              onClick={onPlay}
              className="flex items-center px-5 py-2 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 transition-colors shadow-md"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 mr-2" />
              ) : (
                <PlayIcon className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
              </span>
            </button>
            
            <button
              onClick={onToggleMemorization}
              className="flex items-center px-5 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              {isMarkedForMemorization ? (
                <BookmarkSolidIcon className="h-5 w-5 mr-2" />
              ) : (
                <BookmarkIcon className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {isMarkedForMemorization ? 'Memorized' : 'Memorize'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Ayahs content with improved styling */}
      <div 
        id="surah-content"
        onScroll={handleScroll}
        className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto scroll-smooth"
      >
        {surah.ayahs.map((ayah) => (
          <motion.div 
            key={ayah.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: ayah.numberInSurah * 0.03 }}
            className={`p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors ${
              currentAyah === ayah.number ? 'bg-amber-50 border-amber-200' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                {ayah.numberInSurah}
              </span>
              <button 
                onClick={() => setCurrentAyah(currentAyah === ayah.number ? null : ayah.number)}
                className={`text-slate-400 hover:text-amber-500 transition-colors ${
                  currentAyah === ayah.number ? 'text-amber-500' : ''
                }`}
              >
                <PlayIcon className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-right font-arabic text-2xl md:text-3xl leading-loose mb-4 select-text" dir="rtl">
              {ayah.text}
            </p>
            
            {ayah.translation && (
              <p className="text-slate-700 text-sm border-t border-slate-100 pt-3 leading-relaxed select-text">
                {ayah.translation}
              </p>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors z-10"
          >
            <ChevronDoubleUpIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SurahView; 