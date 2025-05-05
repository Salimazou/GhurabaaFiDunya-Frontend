import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, BookmarkIcon, SpeakerWaveIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
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
      className={`p-3 mb-2 rounded-xl border ${
        isSelected 
          ? 'border-emerald-200 bg-emerald-50/50' 
          : 'border-slate-100 bg-white hover:bg-slate-50'
      } transition-all hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          {isCompleted ? (
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircleSolidIcon className="h-5 w-5 text-emerald-600" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-700 flex-shrink-0">
              {surah.number}
            </div>
          )}
          
          <div className="min-w-0 overflow-hidden">
            <h3 className="font-medium text-slate-800 truncate flex items-center">
              {surah.englishName}
              {isMemorizing && (
                <BookmarkSolidIcon className="h-4 w-4 text-amber-500 ml-1 flex-shrink-0" />
              )}
            </h3>
            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
              <span className="font-arabic truncate" dir="rtl">{surah.name}</span>
              <span className="text-slate-300">•</span>
              <span>{surah.numberOfAyahs} verses</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {onPlay && (
            <button
              onClick={() => onPlay(surah)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all"
              title="Play audio"
              aria-label={`Play Surah ${surah.englishName}`}
            >
              <SpeakerWaveIcon className="h-5 w-5" />
            </button>
          )}

          {onToggleMemorize && (
            <button
              onClick={() => onToggleMemorize(surah)}
              className={`p-1.5 rounded-full transition-all ${
                isMemorizing 
                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
              }`}
              title="Mark for memorization"
              aria-label={`${isMemorizing ? 'Remove from' : 'Add to'} memorization list`}
            >
              {isMemorizing ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {(onSelectStart || onSelectEnd) && (
        <div className="flex space-x-2 mt-2 pt-2 border-t border-slate-100">
          {onSelectStart && (
            <button
              onClick={() => onSelectStart(surah)}
              className={`flex-1 py-1.5 text-xs rounded-md transition-all ${
                isStartSurah
                  ? 'bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Start Reading
            </button>
          )}
          {onSelectEnd && (
            <button
              onClick={() => onSelectEnd(surah)}
              className={`flex-1 py-1.5 text-xs rounded-md transition-all ${
                isEndSurah
                  ? 'bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              End Reading
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default memo(SurahItem); 