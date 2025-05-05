import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, BookmarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const SurahItem = ({ 
  surah, 
  isSelected = false, 
  isCompleted = false, 
  isMemorizing = false,
  isStartSurah = false,
  isEndSurah = false,
  onToggleMemorize,
  onSelectStart,
  onSelectEnd,
  onPlay,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`px-4 py-3 flex items-center text-sm bg-white hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-emerald-50' : ''
      } ${className}`}
    >
      <div className="flex-1 flex items-center min-w-0">
        {isCompleted ? (
          <CheckCircleSolidIcon className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-gray-600 mr-2 flex-shrink-0">
            {surah.number}
          </span>
        )}
        
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center font-medium text-gray-700 truncate">
            <span className="truncate">{surah.englishName}</span>
            <span className="mx-1.5 text-gray-400 flex-shrink-0">·</span>
            <span className="text-gray-500 font-arabic truncate" dir="rtl">{surah.name}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-3 truncate">
            <span>{surah.numberOfAyahs} verses</span>
            <span className="hidden sm:inline">{surah.revelationType}</span>
            {surah.englishNameTranslation && (
              <span className="italic hidden sm:inline truncate">{surah.englishNameTranslation}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
        {onPlay && (
          <button
            onClick={() => onPlay(surah)}
            className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
            title="Play audio"
            aria-label={`Play Surah ${surah.englishName}`}
          >
            <SpeakerWaveIcon className="h-5 w-5" />
          </button>
        )}

        {onToggleMemorize && (
          <button
            onClick={() => onToggleMemorize(surah)}
            className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
            title="Mark for memorization"
            aria-label={`${isMemorizing ? 'Remove from' : 'Add to'} memorization list`}
          >
            {isMemorizing ? (
              <BookmarkSolidIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
          </button>
        )}
        
        {(onSelectStart || onSelectEnd) && (
          <div className="flex space-x-1">
            {onSelectStart && (
              <button
                onClick={() => onSelectStart(surah)}
                className={`px-2 py-1 text-xs rounded ${
                  isStartSurah
                    ? 'bg-emerald-100 text-emerald-800 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Start</span>
                <span className="sm:hidden">S</span>
              </button>
            )}
            {onSelectEnd && (
              <button
                onClick={() => onSelectEnd(surah)}
                className={`px-2 py-1 text-xs rounded ${
                  isEndSurah
                    ? 'bg-emerald-100 text-emerald-800 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">End</span>
                <span className="sm:hidden">E</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(SurahItem); 