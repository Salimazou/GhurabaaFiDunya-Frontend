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

// Define available reciters
const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.saudalshuraim', name: 'Saud Al-Shuraim' },
  { id: 'ar.abdullahawadaljuhani', name: 'Abdullah Juhany' },
  { id: 'ar.aymanswed', name: 'Ayman Suwaid' },
  { id: 'ar.yasseraldossari', name: 'Yasser al Dossari' },
  { id: 'ar.jaberabdulhameed', name: 'Jaber Abdul Hameed' }
];

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
  <div className="absolute inset-0 pointer-events-none opacity-5">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 0h20v20H0zm20 20h20v20H20z" fill="currentColor" />
        <path d="M0 20h20v20H0zm20-20h20v20H20z" fill="none" stroke="currentColor" strokeWidth="0.5" />
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
  const [showReciterSelect, setShowReciterSelect] = useState(false);
  
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
  
  // Handle reciter change
  const handleReciterChange = (reciterId) => {
    setActiveReciter(reciterId);
    setShowReciterSelect(false);
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
      <div className="bg-emerald-100 text-emerald-700 p-4 relative overflow-hidden">
        <IslamicPattern />
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-emerald-600" />
            Koran Planner
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-1.5 rounded-full bg-white/80 text-emerald-700 hover:bg-white hover:text-emerald-600 transition shadow-sm"
              aria-label="Search Quran"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowReciterSelect(!showReciterSelect)}
              className="p-1.5 rounded-full bg-white/80 text-emerald-700 hover:bg-white hover:text-emerald-600 transition shadow-sm"
              aria-label="Select reciter"
            >
              <SpeakerWaveIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 rounded-full bg-white/80 text-emerald-700 hover:bg-white hover:text-emerald-600 transition shadow-sm"
              aria-label="Filter surahs"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <p className="text-emerald-600 mt-1 max-w-md">
          Wat wil je vandaag lezen of onthouden uit de Koran? 🌙
        </p>
        
        {showReciterSelect && (
          <div className="mt-3 bg-white rounded-lg p-3 shadow-sm space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-2">Kies een recitator:</div>
            <div className="grid grid-cols-2 gap-2">
              {RECITERS.map(reciter => (
                <button
                  key={reciter.id}
                  onClick={() => handleReciterChange(reciter.id)}
                  className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                    activeReciter === reciter.id 
                      ? 'bg-emerald-100 text-emerald-700 font-medium' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reciter.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {showFilters && (
          <div className="mt-3 bg-white rounded-lg p-3 shadow-sm space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-2">Toon surahs:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Alles
              </button>
              <button
                onClick={() => setSelectedFilter('completed')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedFilter === 'completed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Voltooid
              </button>
              <button
                onClick={() => setSelectedFilter('memorization')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedFilter === 'memorization' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Memorisatie
              </button>
              <button
                onClick={() => setSelectedFilter('inProgress')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedFilter === 'inProgress' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In Voortgang
              </button>
            </div>
          </div>
        )}
        
        {startSurah && endSurah && (
          <div className="mt-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
            <div className="text-sm font-medium text-slate-700 mb-1">Huidige selectie:</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {startSurah.number === endSurah.number
                  ? `Surah ${startSurah.englishName}`
                  : `Surah ${startSurah.englishName} tot ${endSurah.englishName}`}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={markAsCompleted}
                  className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors flex items-center"
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Voltooid
                </button>
                <button
                  onClick={resetSelections}
                  className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors flex items-center"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-0">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-emerald-600"></div>
            <span className="ml-3 text-slate-600">Laden...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-md bg-amber-50 text-amber-700 mb-4">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Kon Koran-data niet laden. Probeer opnieuw.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1 inline" />
              Probeer opnieuw
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-2 md:p-4 max-h-96 overflow-y-auto">
            {getFilteredJuzs().map((juz) => (
              <div key={juz.juzNumber} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleJuz(juz.juzNumber)}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 text-left"
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mr-2">
                      {juz.juzNumber}
                    </span>
                    <span className="font-medium text-slate-700">Juz {juz.juzNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{juz.surahs.length} surahs</span>
                    <span className="text-xs bg-slate-200 rounded-full h-5 w-5 flex items-center justify-center">
                      {expandedJuz === juz.juzNumber ? '−' : '+'}
                    </span>
                  </div>
                </button>
                
                {expandedJuz === juz.juzNumber && (
                  <div className="p-3 bg-white">
                    <SurahGroup 
                      surahs={juz.surahs}
                      completedSurahs={completedSurahs}
                      markedForMemorization={markedForMemorization}
                      startSurah={startSurah}
                      endSurah={endSurah}
                      onSelectStartSurah={handleSelectStartSurah}
                      onSelectEndSurah={handleSelectEndSurah}
                      onToggleMemorization={toggleMemorization}
                      onPlayAudio={handlePlayAudio}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {getFilteredJuzs().length === 0 && (
              <p className="text-center p-6 text-slate-500">
                Geen surahs gevonden voor de geselecteerde filter.
              </p>
            )}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showSearch && (
          <QuranSearch 
            onClose={() => setShowSearch(false)} 
            onSelectSurah={handleSearchResult}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-4">Markeer als voltooid</h3>
              <p className="text-slate-600 mb-6">
                {startSurah && endSurah && startSurah.number === endSurah.number
                  ? `Heb je Surah ${startSurah.englishName} voltooid?`
                  : `Wil je alle surahs van ${startSurah?.englishName} tot ${endSurah?.englishName} markeren als voltooid?`}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleCompletionConfirm(true)}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
                >
                  Bevestigen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {audioSurah && (
        <QuranAudioPlayer 
          surah={audioSurah} 
          onClose={() => setAudioSurah(null)}
          audioIdentifier={activeReciter}
        />
      )}
    </div>
  );
};

export default EnhancedQuranPlanner; 