import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  CheckIcon, 
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import quranAPI from '../../services/quranAPI';
import SurahGroup from './SurahGroup';
import QuranAudioPlayer from './QuranAudioPlayer';
import QuranSearch from './QuranSearch';

// Helper to group surahs by juz (30 equal parts)
const groupByJuz = (surahs) => {
  // Create a proper Juz division based on the traditional Islamic division
  // This is a simplified version - in reality, the Juz divisions don't perfectly align with Surah boundaries
  const juzs = [];
  
  // Define approximate Juz starting surahs (this is simplified)
  const juzStartingSurahs = [
    1, 2, 2, 2, 2, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 
    23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78
  ];
  
  // Create the juz groups
  for (let i = 0; i < 30; i++) {
    const startIdx = juzStartingSurahs[i] - 1;
    const endIdx = i < 29 ? juzStartingSurahs[i + 1] - 1 : surahs.length;
    
    // Get surahs for this juz
    let juzSurahs = [];
    if (i === 0) {
      juzSurahs = surahs.slice(0, endIdx);
    } else {
      juzSurahs = surahs.slice(startIdx, endIdx);
    }
    
    juzs.push({
      juzNumber: i + 1,
      surahs: juzSurahs
    });
  }
  
  return juzs;
};

// Islamic pattern for visual decoration
const IslamicPattern = () => (
  <div className="absolute inset-0 pointer-events-none opacity-10">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 0h20v20H0zm20 20h20v20H20z" fill="currentColor" />
        <path d="M0 20h20v20H0zm20-20h20v20H20z" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  </div>
);

const EnhancedQuranPlanner = () => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startSurah, setStartSurah] = useState(null);
  const [endSurah, setEndSurah] = useState(null);
  const [completedSurahs, setCompletedSurahs] = useState([]);
  const [markedForMemorization, setMarkedForMemorization] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [audioSurah, setAudioSurah] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [groupedSurahs, setGroupedSurahs] = useState([]);
  const [expandedJuz, setExpandedJuz] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeReciter, setActiveReciter] = useState('ar.alafasy');
  const [showFilters, setShowFilters] = useState(false);
  
  // Load surahs from API when component mounts
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await quranAPI.getAllSurahs();
        setSurahs(data);
        
        // Group surahs after fetching
        setGroupedSurahs(groupByJuz(data));
        
        // Expand the first juz by default
        setExpandedJuz(1);
      } catch (err) {
        console.error('Error fetching surahs:', err);
        setError('Could not load Quran data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurahs();
    
    // Load saved state from localStorage
    const loadSavedState = () => {
      try {
        const savedCompleted = localStorage.getItem('completedSurahs');
        const savedMemorization = localStorage.getItem('memorizationSurahs');
        
        if (savedCompleted) {
          setCompletedSurahs(JSON.parse(savedCompleted));
        }
        
        if (savedMemorization) {
          setMarkedForMemorization(JSON.parse(savedMemorization));
        }
      } catch (err) {
        console.error('Error loading saved state:', err);
      }
    };
    
    loadSavedState();
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('completedSurahs', JSON.stringify(completedSurahs));
  }, [completedSurahs]);
  
  useEffect(() => {
    localStorage.setItem('memorizationSurahs', JSON.stringify(markedForMemorization));
  }, [markedForMemorization]);
  
  // Toggle juz expansion
  const toggleJuz = useCallback((juzNumber) => {
    setExpandedJuz(expandedJuz === juzNumber ? null : juzNumber);
  }, [expandedJuz]);
  
  // Set the starting surah
  const handleSelectStartSurah = useCallback((surah) => {
    setStartSurah(surah);
    if (!endSurah || surah.number > endSurah.number) {
      setEndSurah(surah);
    }
  }, [endSurah]);
  
  // Set the ending surah
  const handleSelectEndSurah = useCallback((surah) => {
    if (startSurah && surah.number < startSurah.number) {
      setStartSurah(surah);
      setEndSurah(surah);
    } else {
      setEndSurah(surah);
    }
  }, [startSurah]);
  
  // Mark a surah for memorization
  const toggleMemorization = useCallback((surah) => {
    setMarkedForMemorization(prev => 
      prev.includes(surah.number) 
        ? prev.filter(num => num !== surah.number)
        : [...prev, surah.number]
    );
  }, []);
  
  // Mark surahs as completed
  const markAsCompleted = useCallback(() => {
    setShowCompletionModal(true);
  }, []);
  
  // Handle completion confirmation
  const handleCompletionConfirm = useCallback((allCompleted) => {
    if (startSurah && endSurah) {
      if (allCompleted) {
        // Mark all selected surahs as completed
        const newCompleted = [];
        for (let i = startSurah.number; i <= endSurah.number; i++) {
          if (!completedSurahs.includes(i)) {
            newCompleted.push(i);
          }
        }
        setCompletedSurahs(prev => [...prev, ...newCompleted]);
      } else {
        // Show modal to select which surahs were completed
        // For simplicity, we'll just add the start surah here
        setCompletedSurahs(prev => 
          prev.includes(startSurah.number) 
            ? prev 
            : [...prev, startSurah.number]
        );
      }
    }
    setShowCompletionModal(false);
  }, [startSurah, endSurah, completedSurahs]);
  
  // Play audio for a surah
  const handlePlayAudio = useCallback((surah) => {
    setAudioSurah(surah);
  }, []);
  
  // Reset selections
  const resetSelections = useCallback(() => {
    setStartSurah(null);
    setEndSurah(null);
  }, []);
  
  // Handle search result selection
  const handleSearchResult = useCallback((surah) => {
    // Find the juz that contains this surah
    for (let i = 0; i < groupedSurahs.length; i++) {
      const juz = groupedSurahs[i];
      for (const s of juz.surahs) {
        if (s.number === surah.number) {
          // Selected surah found, update the selection and expand the juz
          handleSelectStartSurah(surah);
          setExpandedJuz(juz.juzNumber);
          setShowSearch(false);
          return;
        }
      }
    }
  }, [groupedSurahs, handleSelectStartSurah]);
  
  // Filter surahs based on selected filter
  const getFilteredJuzs = useCallback(() => {
    if (selectedFilter === 'all') {
      return groupedSurahs;
    } else if (selectedFilter === 'completed') {
      return groupedSurahs.map(juz => ({
        ...juz,
        surahs: juz.surahs.filter(surah => completedSurahs.includes(surah.number))
      })).filter(juz => juz.surahs.length > 0);
    } else if (selectedFilter === 'memorization') {
      return groupedSurahs.map(juz => ({
        ...juz,
        surahs: juz.surahs.filter(surah => markedForMemorization.includes(surah.number))
      })).filter(juz => juz.surahs.length > 0);
    } else if (selectedFilter === 'inProgress') {
      return groupedSurahs.map(juz => ({
        ...juz,
        surahs: juz.surahs.filter(surah => 
          startSurah && 
          endSurah && 
          surah.number >= startSurah.number && 
          surah.number <= endSurah.number &&
          !completedSurahs.includes(surah.number)
        )
      })).filter(juz => juz.surahs.length > 0);
    }
    
    return groupedSurahs;
  }, [groupedSurahs, selectedFilter, completedSurahs, markedForMemorization, startSurah, endSurah]);
  
  // Reset all progress
  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      setCompletedSurahs([]);
      setMarkedForMemorization([]);
      setStartSurah(null);
      setEndSurah(null);
      localStorage.removeItem('completedSurahs');
      localStorage.removeItem('memorizationSurahs');
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center relative overflow-hidden">
        <IslamicPattern />
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading Quran data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 relative overflow-hidden">
        <IslamicPattern />
        <div className="text-red-500 text-center relative">
          <p className="font-bold text-lg mb-2">Error</p>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  const filteredJuzs = getFilteredJuzs();
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
      <div className="p-5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white relative overflow-hidden">
        <IslamicPattern />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Koran Planner</h2>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-emerald-600 rounded-full text-white transition-colors"
              aria-label="Filter Options"
              title="Filter Options"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-emerald-600 rounded-full text-white transition-colors"
              aria-label="Search Quran"
              title="Search Quran"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            
            {startSurah && endSurah && (
              <>
                <button
                  onClick={markAsCompleted}
                  className="p-2 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium transition-colors flex items-center"
                  title="Mark as Completed"
                >
                  <CheckIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Markeer als Voltooid</span>
                </button>
                <button
                  onClick={resetSelections}
                  className="p-2 sm:px-3 sm:py-1.5 bg-emerald-800 hover:bg-emerald-900 rounded-md text-sm font-medium transition-colors"
                  title="Reset Selection"
                >
                  <XMarkIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {startSurah && endSurah ? (
          <div className="mt-3 text-emerald-50">
            <p>Vandaag lezen: <span className="font-semibold">
              {startSurah.number === endSurah.number 
                ? `Surah ${startSurah.number}: ${startSurah.englishName} (${startSurah.name})` 
                : `Surah ${startSurah.number}-${endSurah.number}: ${startSurah.englishName} (${startSurah.name}) tot ${endSurah.englishName} (${endSurah.name})`}
            </span></p>
          </div>
        ) : (
          <p className="mt-3 text-emerald-100 text-sm">
            Selecteer de surahs die je vandaag wilt lezen of memoriseren.
          </p>
        )}
        
        {/* Filter dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 mr-5 bg-white rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div className="py-2 px-1 w-64">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700">Filter Surahs</h3>
                </div>
                
                <div className="flex flex-col space-y-1 p-2">
                  <button 
                    className={`px-3 py-2 text-left rounded text-sm ${selectedFilter === 'all' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedFilter('all')}
                  >
                    All Surahs
                  </button>
                  <button 
                    className={`px-3 py-2 text-left rounded text-sm ${selectedFilter === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedFilter('completed')}
                  >
                    Completed Surahs
                  </button>
                  <button 
                    className={`px-3 py-2 text-left rounded text-sm ${selectedFilter === 'memorization' ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedFilter('memorization')}
                  >
                    Memorization Surahs
                  </button>
                  <button 
                    className={`px-3 py-2 text-left rounded text-sm ${selectedFilter === 'inProgress' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedFilter('inProgress')}
                  >
                    In Progress
                  </button>
                </div>
                
                <div className="mt-2 px-3 py-2 border-t border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-2">Reciter</h3>
                  <select 
                    value={activeReciter}
                    onChange={(e) => setActiveReciter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="ar.alafasy">Mishary Rashid Alafasy</option>
                    <option value="ar.abdulbasitmurattal">Abdul Basit Murattal</option>
                    <option value="ar.abdullahbasfar">Abdullah Basfar</option>
                    <option value="ar.abdurrahmaansudais">Abdurrahmaan As-Sudais</option>
                    <option value="ar.minshawi">Minshawi</option>
                    <option value="ar.muhammadayyoub">Muhammad Ayyoub</option>
                  </select>
                </div>
                
                <div className="border-t border-gray-100 pt-3 px-3">
                  <button
                    onClick={handleResetAll}
                    className="text-red-600 text-sm hover:underline flex items-center"
                  >
                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                    Reset All Progress
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Quran Search Modal */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full">
                <div className="flex justify-end p-2">
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <QuranSearch 
                  onSelectResult={handleSearchResult}
                  onClose={() => setShowSearch(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto p-1 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredJuzs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No surahs found matching the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJuzs.map(juz => (
              <SurahGroup
                key={juz.juzNumber}
                title={`Juz ${juz.juzNumber}`}
                surahs={juz.surahs}
                startSurah={startSurah}
                endSurah={endSurah}
                completedSurahs={completedSurahs}
                memorizationSurahs={markedForMemorization}
                onSelectStart={handleSelectStartSurah}
                onSelectEnd={handleSelectEndSurah}
                onToggleMemorize={toggleMemorization}
                onPlayAudio={handlePlayAudio}
                isExpanded={expandedJuz === juz.juzNumber}
                onToggleExpand={() => toggleJuz(juz.juzNumber)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Stats section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between text-sm">
          <div className="mb-2 sm:mb-0">
            <span className="text-gray-500">Voltooid: </span>
            <span className="font-medium text-emerald-700">{completedSurahs.length} surahs</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-500">Voor memorisatie: </span>
            <span className="font-medium text-amber-500">{markedForMemorization.length} surahs</span>
          </div>
          <div className="text-gray-500">
            <span>Geselecteerd: </span>
            <span className="font-medium">
              {startSurah && endSurah ? 
                (startSurah.number === endSurah.number ? 
                  '1 surah' : 
                  `${endSurah.number - startSurah.number + 1} surahs`) : 
                '0 surahs'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Heb je alle geselecteerde surahs voltooid?
              </h3>
              
              <p className="text-gray-600 mb-6">
                {startSurah && endSurah ? (
                  startSurah.number === endSurah.number ? (
                    <>Je hebt geselecteerd: <span className="font-medium">Surah {startSurah.number}: {startSurah.englishName}</span></>
                  ) : (
                    <>Je hebt geselecteerd: <span className="font-medium">Surah {startSurah.number}-{endSurah.number}: van {startSurah.englishName} tot {endSurah.englishName}</span></>
                  )
                ) : (
                  "Geen selectie gemaakt"
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => handleCompletionConfirm(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Ja, alles voltooid
                </button>
                <button
                  onClick={() => handleCompletionConfirm(false)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Nee, gedeeltelijk
                </button>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Audio Player */}
      <AnimatePresence>
        {audioSurah && (
          <QuranAudioPlayer
            surah={audioSurah}
            onClose={() => setAudioSurah(null)}
            audioIdentifier={activeReciter}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedQuranPlanner; 