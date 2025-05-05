import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SurahItem from './SurahItem';

const SurahGroup = ({ 
  title, 
  surahs = [],
  startSurah,
  endSurah,
  completedSurahs = [],
  memorizationSurahs = [],
  onSelectStart,
  onSelectEnd,
  onToggleMemorize,
  onPlayAudio,
  className = '',
  isExpanded = false,
  onToggleExpand
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  // Update local expanded state when prop changes
  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  // Handle expand toggle with callback
  const toggleExpand = () => {
    setExpanded(!expanded);
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  // Function to check if a surah is within the selected range
  const isInSelectedRange = (surahNumber) => {
    return startSurah && 
           endSurah && 
           surahNumber >= startSurah.number && 
           surahNumber <= endSurah.number;
  };

  // Get total completed in this group
  const completedInGroup = surahs.filter(surah => 
    completedSurahs.includes(surah.number)
  ).length;

  // Get total memorizing in this group
  const memorizingInGroup = surahs.filter(surah => 
    memorizationSurahs.includes(surah.number)
  ).length;

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <button
        onClick={toggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-800">{title}</span>
          {(completedInGroup > 0 || memorizingInGroup > 0) && (
            <div className="ml-3 flex space-x-2">
              {completedInGroup > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  {completedInGroup} completed
                </span>
              )}
              {memorizingInGroup > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  {memorizingInGroup} memorizing
                </span>
              )}
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            {surahs.map(surah => (
              <SurahItem
                key={surah.number}
                surah={surah}
                isSelected={isInSelectedRange(surah.number)}
                isCompleted={completedSurahs.includes(surah.number)}
                isMemorizing={memorizationSurahs.includes(surah.number)}
                isStartSurah={startSurah?.number === surah.number}
                isEndSurah={endSurah?.number === surah.number}
                onToggleMemorize={() => onToggleMemorize(surah)}
                onSelectStart={() => onSelectStart(surah)}
                onSelectEnd={() => onSelectEnd(surah)}
                onPlay={onPlayAudio ? () => onPlayAudio(surah) : undefined}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurahGroup; 