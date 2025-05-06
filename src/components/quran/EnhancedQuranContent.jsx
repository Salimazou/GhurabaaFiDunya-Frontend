import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  PlayIcon, 
  PauseIcon, 
  BookmarkIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  ArrowsPointingOutIcon,
  ForwardIcon,
  BackwardIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import quranAPI from '../../services/quranAPI';
import SurahView from './SurahView';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';

// Define available reciters
const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.saudalshuraim', name: 'Saud Al-Shuraim' },
  { id: 'ar.abdullahawadaljuhani', name: 'Abdullah Juhany' },
  { id: 'ar.aymanswed', name: 'Ayman Suwaid' },
  { id: 'ar.yasseraldossari', name: 'Yasser al Dossari' },
  { id: 'ar.jaberabdulhameed', name: 'Jaber Abdul Hameed' },
  { id: '58', name: 'Abdullah Albuajan' },
  { id: '98', name: 'Abdullah Abdal' },
  { id: '54', name: 'Abdulrahman Alsudaes' },
  { id: '107', name: 'Mohammed Al-Lohaidan' },
  { id: '137', name: 'Ahmad Talib bin Humaid' }
];

// Component for the enhanced Quran tab
const EnhancedQuranContent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [juzData, setJuzData] = useState([]);
  const [expandedJuz, setExpandedJuz] = useState(null);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [markedForMemorization, setMarkedForMemorization] = useState([]);
  const [viewMode, setViewMode] = useState('juz'); // 'juz', 'surah', 'memorization', or 'surahView'
  const [allSurahs, setAllSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastReadSurah, setLastReadSurah] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [reciterOptions, setReciterOptions] = useState(RECITERS);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [availableSurahs, setAvailableSurahs] = useState([]);

  const audioRef = useRef(null);
  
  // Get current user ID for storage keys
  const getCurrentUserId = () => {
    if (!user) {
      // If user is not authenticated, return a default value
      return 'anonymous';
    }
    // Return the user ID if available
    return user.id || 'anonymous';
  };
  
  // Check if user is authenticated and can use features
  const checkUserAccess = () => {
    if (!user) {
      toast.error("Je hebt geen toegang tot deze functie. Log in om deze functie te gebruiken.");
      return false;
    }
    return true;
  };
  
  // Update available surahs based on selected reciter
  const updateAvailableSurahs = async (reciterId) => {
    try {
      // For Islamic Network reciters (ar.xxx format), all surahs are available
      if (reciterId.startsWith('ar.')) {
        setAvailableSurahs(allSurahs.map(surah => surah.number));
        return;
      }
      
      // For MP3Quran reciters (numeric IDs), we need to check which surahs are available
      // These reciter IDs have specific server mappings and available surahs
      const reciterServers = {
        '58': { surahs: Array.from({length: 114}, (_, i) => i + 1) }, // All surahs
        '98': { surahs: Array.from({length: 114}, (_, i) => i + 1) }, // All surahs
        '54': { surahs: Array.from({length: 114}, (_, i) => i + 1) }, // All surahs
        '107': { surahs: Array.from({length: 114}, (_, i) => i + 1) }, // All surahs
        '137': { surahs: Array.from({length: 114}, (_, i) => i + 1) }  // All surahs
      };
      
      if (reciterServers[reciterId]) {
        setAvailableSurahs(reciterServers[reciterId].surahs);
      } else {
        // Default to all surahs if reciter info not found
        setAvailableSurahs(allSurahs.map(surah => surah.number));
      }
    } catch (err) {
      console.error(`Error updating available surahs for reciter ${reciterId}:`, err);
      // Default to all surahs on error
      setAvailableSurahs(allSurahs.map(surah => surah.number));
    }
  };
  
  // Format time (seconds) to mm:ss
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset memorization data when user logs out
  useEffect(() => {
    // Als de user null wordt (uitgelogd), wis dan alle memorisatie- en gebruikersspecifieke data
    if (!user) {
      setMarkedForMemorization([]);
      setLastReadSurah(null);
    }
  }, [user]);
  
  // Load all surahs and group them by juz on component mount
  useEffect(() => {
    const fetchQuranData = async () => {
      try {
        setLoading(true);
        
        // Fetch all surahs
        const surahsData = await quranAPI.getAllSurahs();
        setAllSurahs(surahsData);
        setAvailableSurahs(surahsData.map(surah => surah.number)); // Initially all surahs are available
        
        // Create juz data structure
        const juzCount = 30;
        const juzs = [];
        
        // This is a simplified approach - in reality, juz boundaries don't perfectly
        // align with surah boundaries, but for UI purposes this is a reasonable approximation
        const surahsPerJuz = Math.ceil(surahsData.length / juzCount);
        
        for (let i = 0; i < juzCount; i++) {
          const startIdx = i * surahsPerJuz;
          const endIdx = Math.min((i + 1) * surahsPerJuz, surahsData.length);
          
          juzs.push({
            juzNumber: i + 1,
            surahs: surahsData.slice(startIdx, endIdx)
          });
        }
        
        setJuzData(juzs);
        
        // Only load user-specific data if a user is logged in
        if (user && user.id) {
          // Load saved memorization state with user identifier
          const userId = getCurrentUserId();
          const savedMemorizationKey = `memorization_surahs_${userId}`;
          const savedMemorization = localStorage.getItem(savedMemorizationKey);
          if (savedMemorization) {
            setMarkedForMemorization(JSON.parse(savedMemorization));
          }
          
          // Load last read surah with user identifier
          const lastReadKey = `last_read_surah_${userId}`;
          const lastRead = localStorage.getItem(lastReadKey);
          if (lastRead) {
            setLastReadSurah(JSON.parse(lastRead));
          }
          
          // Load saved reciter preference with user identifier
          const savedReciterKey = `selected_reciter_${userId}`;
          const savedReciter = localStorage.getItem(savedReciterKey);
          if (savedReciter) {
            setSelectedReciter(savedReciter);
            // We'll update available surahs based on the selected reciter
            updateAvailableSurahs(savedReciter);
          }
        } else {
          // If no user is logged in, clear any personalized data
          setMarkedForMemorization([]);
          setLastReadSurah(null);
          // Keep default reciter but don't load from storage
          updateAvailableSurahs(selectedReciter);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Quran data:', err);
        setError('Could not load Quran data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQuranData();
  }, [user]); // Add user as a dependency so data refreshes on login/logout
  
  // Save memorization state to localStorage when it changes
  useEffect(() => {
    // Only save if there's a real user (not anonymous)
    if (user && user.id) {
      const userId = getCurrentUserId();
      const savedMemorizationKey = `memorization_surahs_${userId}`;
      localStorage.setItem(savedMemorizationKey, JSON.stringify(markedForMemorization));
    }
  }, [markedForMemorization, user]);
  
  // Save selected reciter when it changes
  useEffect(() => {
    // Only save if there's a real user (not anonymous)
    if (user && user.id) {
      const userId = getCurrentUserId();
      const savedReciterKey = `selected_reciter_${userId}`;
      localStorage.setItem(savedReciterKey, selectedReciter);
    }
    
    // Update available surahs when reciter changes
    updateAvailableSurahs(selectedReciter);
  }, [selectedReciter, user]);
  
  // Save last read surah
  const saveLastReadSurah = (surah) => {
    // No authentication check needed for reading, but we'll use user ID for storage
    const userId = getCurrentUserId();
    const lastReadKey = `last_read_surah_${userId}`;
    const surahData = {
      number: surah.number,
      englishName: surah.englishName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(lastReadKey, JSON.stringify(surahData));
    setLastReadSurah(surahData);
  };
  
  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      // Remove event listeners
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Update audio volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Toggle juz expansion
  const toggleJuz = (juzNumber) => {
    setExpandedJuz(expandedJuz === juzNumber ? null : juzNumber);
  };
  
  // Play audio for a surah
  const playSurah = async (surah) => {
    try {
      // Check if the surah is available for the selected reciter
      if (!availableSurahs.includes(surah.number)) {
        toast.error(`Surah ${surah.englishName} is not available for the selected reciter.`);
        return;
      }
      
      if (currentSurah && currentSurah.number === surah.number) {
        // Toggle play/pause if same surah
        togglePlayPause();
      } else {
        // Load new surah
        setCurrentSurah(surah);
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Get audio URL with selected reciter
        const audioUrl = await quranAPI.getAudioUrl(surah.number, selectedReciter);
        
        // Set audio source and play
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          audioRef.current.play().catch(err => {
            console.error('Error playing audio:', err);
            toast.error(`Fout bij het afspelen van audio. Probeer een andere reciteur.`);
          });
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Error playing surah:', err);
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !currentSurah) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Seek to a specific position in the audio
  const seekTo = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    if (audioRef.current && duration) {
      const newTime = pos * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Jump forward/backward
  const jumpTime = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Toggle memorization for a surah
  const toggleMemorization = (surah) => {
    // Check if user is authenticated to use this feature
    if (!checkUserAccess()) {
      return;
    }
    
    setMarkedForMemorization(prev => 
      prev.includes(surah.number) 
        ? prev.filter(num => num !== surah.number)
        : [...prev, surah.number]
    );
  };
  
  // Show the surah content
  const viewSurah = async (surah) => {
    try {
      setLoading(true);
      // Fetch full surah content (with ayahs)
      const surahData = await quranAPI.getSurah(surah.number);
      setCurrentSurah(surahData);
      setViewMode('surahView'); // Switch to surah view mode
      setLoading(false);
    } catch (err) {
      console.error('Error fetching surah:', err);
      setError('Could not load surah content.');
      setLoading(false);
    }
  };
  
  // Handle back from surah view
  const handleBackFromSurah = () => {
    setViewMode('juz'); // Or whatever the previous mode was
  };
  
  // Render random surah feature
  const renderRandomSurahButton = () => (
    <button
      onClick={() => {
        const randomIndex = Math.floor(Math.random() * allSurahs.length);
        playSurah(allSurahs[randomIndex]);
      }}
      className="flex items-center p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
    >
      <ArrowPathIcon className="h-4 w-4 mr-1" />
      <span className="text-sm font-medium">Random Surah</span>
    </button>
  );
  
  // Render memorization filter button
  const renderMemorizationFilterButton = () => (
    <button
      onClick={() => {
        if (viewMode === 'memorization') {
          // Always allow going back to normal view
          setViewMode('juz');
        } else {
          // Check if user is authenticated to use memorization feature
          if (checkUserAccess()) {
            setViewMode('memorization');
          }
        }
      }}
      className={`flex items-center p-2 rounded-lg transition-colors ${
        viewMode === 'memorization' 
          ? 'bg-emerald-600 text-white' 
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      }`}
      title={!user ? "Log in om te memoriseren" : "Memorisatie"}
    >
      <BookmarkIcon className="h-4 w-4 mr-1" />
      <span className="text-sm font-medium">Memorization</span>
    </button>
  );
  
  // Filter surahs based on search query and availability
  const getFilteredSurahs = (surahs) => {
    if (!surahs) return [];
    
    // First filter by availability
    let filtered = surahs.filter(surah => availableSurahs.includes(surah.number));
    
    // Then filter by search if needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(surah => 
        surah.number.toString().includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  // Render the juz accordion view
  const renderJuzAccordion = () => {
    const filteredJuzs = juzData.map(juz => {
      // Filter surahs by search, memorization, and availability
      let filteredSurahs = juz.surahs;
      
      // Apply memorization filter if in memorization mode
      if (viewMode === 'memorization') {
        filteredSurahs = filteredSurahs.filter(surah => 
          markedForMemorization.includes(surah.number)
        );
      }
      
      // Apply search filter and availability filter
      filteredSurahs = getFilteredSurahs(filteredSurahs);
      
      return {
        ...juz,
        surahs: filteredSurahs
      };
    }).filter(juz => juz.surahs.length > 0);
    
    return (
      <div className="space-y-6">
        {filteredJuzs.map((juz) => {
          // Always show first 2 surahs as preview, unless expanded
          const previewSurahs = juz.surahs.slice(0, 2);
          const remainingSurahs = juz.surahs.slice(2);
          const isExpanded = expandedJuz === juz.juzNumber;
          
          return (
            <div key={juz.juzNumber} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleJuz(juz.juzNumber)}
                className="w-full p-5 flex justify-between items-center text-left hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-4">
                    <span className="font-semibold">{juz.juzNumber}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 text-lg">Juz {juz.juzNumber}</h3>
                    <p className="text-sm text-slate-500">
                      {juz.surahs.length} surahs • 
                      {juz.surahs[0].englishName} - {juz.surahs[juz.surahs.length - 1].englishName}
                    </p>
                  </div>
                </div>
                
                <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </button>
              
              {/* Preview of first 2 surahs (always visible) */}
              <div className="px-5 pb-3 border-t border-slate-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
                  {previewSurahs.map((surah) => (
                    <SurahCard 
                      key={surah.number}
                      surah={surah}
                      isMarkedForMemorization={markedForMemorization.includes(surah.number)}
                      isPlaying={currentSurah && currentSurah.number === surah.number && isPlaying}
                      onToggleMemorization={() => toggleMemorization(surah)}
                      onPlay={() => playSurah(surah)}
                      onView={() => {
                        viewSurah(surah);
                        saveLastReadSurah(surah);
                      }}
                    />
                  ))}
                </div>
                
                {/* Remaining surahs (expandable) */}
                {remainingSurahs.length > 0 && (
                  <>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-3 border-t border-slate-100">
                            {remainingSurahs.map((surah) => (
                              <SurahCard 
                                key={surah.number}
                                surah={surah}
                                isMarkedForMemorization={markedForMemorization.includes(surah.number)}
                                isPlaying={currentSurah && currentSurah.number === surah.number && isPlaying}
                                onToggleMemorization={() => toggleMemorization(surah)}
                                onPlay={() => playSurah(surah)}
                                onView={() => {
                                  viewSurah(surah);
                                  saveLastReadSurah(surah);
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isExpanded && (
                      <div className="text-center pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => toggleJuz(juz.juzNumber)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Show {remainingSurahs.length} more surahs
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredJuzs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-slate-600">No surahs found for the selected filter.</p>
          </div>
        )}
      </div>
    );
  };
  
  // Reusable Surah Card component
  const SurahCard = ({ 
    surah, 
    isMarkedForMemorization, 
    isPlaying, 
    onToggleMemorization, 
    onPlay, 
    onView 
  }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mr-2">
            {surah.number}
          </span>
          <span className="font-medium text-slate-700">{surah.englishName}</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Here we don't need to check user access again since toggleMemorization already does it
            onToggleMemorization();
          }}
          className="text-emerald-600 hover:text-emerald-700"
          aria-label={isMarkedForMemorization ? "Remove from memorization" : "Add to memorization"}
          title={!user ? "Log in om te memoriseren" : (isMarkedForMemorization ? "Verwijder van memorisatie" : "Toevoegen aan memorisatie")}
        >
          {isMarkedForMemorization ? (
            <BookmarkSolidIcon className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <div className="flex justify-between mb-3">
        <p className="text-xs text-slate-500">{surah.englishNameTranslation}</p>
        <p className="text-xs text-slate-600">{surah.numberOfAyahs} ayahs</p>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={`flex-1 flex items-center justify-center p-1.5 rounded-md ${
            isPlaying 
              ? 'bg-amber-600 text-white' 
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          } transition-colors`}
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4 mr-1" />
          ) : (
            <PlayIcon className="h-4 w-4 mr-1" />
          )}
          <span className="text-xs font-medium">Listen</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="flex-1 flex items-center justify-center p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
        >
          <BookOpenIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Read</span>
        </button>
      </div>
    </div>
  );
  
  // Render the surah grid view
  const renderSurahGrid = () => {
    const filteredSurahs = getFilteredSurahs(
      viewMode === 'memorization'
        ? allSurahs.filter(surah => markedForMemorization.includes(surah.number))
        : allSurahs
    );
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredSurahs.map((surah) => (
          <motion.div 
            key={surah.number}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all relative"
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mr-3">
                    {surah.number}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800 text-lg mb-0.5">{surah.englishName}</h3>
                    <p className="text-xs text-slate-500">{surah.englishNameTranslation}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleMemorization(surah)}
                  className={`text-emerald-600 hover:text-emerald-700 p-1 rounded-full ${
                    markedForMemorization.includes(surah.number) ? 'bg-emerald-50' : ''
                  }`}
                  aria-label={markedForMemorization.includes(surah.number) ? "Remove from memorization" : "Add to memorization"}
                >
                  {markedForMemorization.includes(surah.number) ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span>{surah.revelationType}</span>
                <span>{surah.numberOfAyahs} ayahs</span>
              </div>
              
              <div className="mt-auto pt-3 flex space-x-2">
                <button
                  onClick={() => playSurah(surah)}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md ${
                    currentSurah && currentSurah.number === surah.number && isPlaying
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  } transition-colors`}
                >
                  {currentSurah && currentSurah.number === surah.number && isPlaying ? (
                    <PauseIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <PlayIcon className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-medium">Listen</span>
                </button>
                
                <button
                  onClick={() => {
                    viewSurah(surah);
                    saveLastReadSurah(surah);
                  }}
                  className="flex-1 flex items-center justify-center py-2 px-3 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Read</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredSurahs.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-slate-600">No surahs found for the selected filter.</p>
          </div>
        )}
      </div>
    );
  };
  
  // Render a floating audio player bar
  const renderAudioPlayer = () => {
    if (!currentSurah) return null;
    
    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-slate-200 p-3 z-40"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                {currentSurah.number}
              </div>
              <div>
                <h3 className="font-medium text-slate-800">{currentSurah.englishName}</h3>
                <p className="text-xs text-slate-500">{currentSurah.englishNameTranslation}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => jumpTime(-10)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <BackwardIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>
              
              <button
                onClick={() => jumpTime(10)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <ForwardIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setCurrentSurah(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors ml-2"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 w-10 text-right">{formatTime(currentTime)}</span>
            
            <div className="flex-1 relative h-3 group">
              <div 
                onClick={seekTo}
                className="absolute inset-0 h-2 bg-slate-200 rounded-full cursor-pointer top-0.5"
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
                <div 
                  className="absolute h-4 w-4 rounded-full bg-white border-2 border-emerald-500 opacity-0 group-hover:opacity-100 top-[-3px] transition-opacity"
                  style={{ left: `calc(${(currentTime / duration) * 100}% - 3px)` }}
                ></div>
              </div>
            </div>
            
            <span className="text-xs text-slate-500 w-10">{formatTime(duration)}</span>
            
            <div className="flex items-center px-2">
              <SpeakerWaveIcon className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render the header with search and view toggle
  const renderHeader = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <BookOpenIcon className="h-6 w-6 text-emerald-600 mr-2" />
            Quran Explorer
          </h2>
          
          {lastReadSurah && (
            <button 
              onClick={() => {
                const surah = allSurahs.find(s => s.number === lastReadSurah.number);
                if (surah) viewSurah(surah);
              }}
              className="flex items-center p-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <BookmarkIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Last read: {lastReadSurah.englishName}
              </span>
            </button>
          )}
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Zoek op surah naam, nummer of betekenis..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <XMarkIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        
        {/* View toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode('juz')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewMode === 'juz' 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4 mr-2" />
              <span>Juz View</span>
            </button>
            
            <button
              onClick={() => setViewMode('surah')}
              className={`flex items-center px-4 py-2 text-sm font-medium border-t border-b ${
                viewMode === 'surah' 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4 mr-2" />
              <span>Surah Grid</span>
            </button>
            
            <button
              onClick={() => {
                if (viewMode === 'memorization') {
                  // Always allow going back to normal view
                  setViewMode('juz');
                } else {
                  // Check if user is authenticated to use memorization feature
                  if (checkUserAccess()) {
                    setViewMode('memorization');
                  }
                }
              }}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg border ${
                viewMode === 'memorization' 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={!user ? "Log in om te memoriseren" : "Memorisatie"}
            >
              <BookmarkIcon className="h-4 w-4 mr-2" />
              <span>Memorization</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowReciterModal(true)}
              className="flex items-center p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Select Reciter</span>
            </button>
            
            <button
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * allSurahs.length);
                playSurah(allSurahs[randomIndex]);
              }}
              className="flex items-center p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Random Surah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Reciter selection modal
  const renderReciterModal = () => {
    if (!showReciterModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800">Select Reciter</h3>
            <button
              onClick={() => setShowReciterModal(false)}
              className="p-1 rounded-full hover:bg-slate-100"
            >
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            {reciterOptions.map(reciter => (
              <div 
                key={reciter.id}
                onClick={() => {
                  setSelectedReciter(reciter.id);
                  setShowReciterModal(false);
                  
                  // If currently playing, restart with new reciter
                  if (currentSurah && isPlaying) {
                    setTimeout(() => playSurah(currentSurah), 100);
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedReciter === reciter.id
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <div className="font-medium">{reciter.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {reciter.id.startsWith('ar.') 
                    ? 'All surahs available' 
                    : 'All surahs available'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowReciterModal(false)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Render the main component
  return (
    <div className="relative pb-24">
      {/* Header with search, view toggle, and filters */}
      {renderHeader()}
      
      {/* Main content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
          <span className="ml-3 text-slate-600">Loading Quran data...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : viewMode === 'surahView' && currentSurah ? (
        <SurahView 
          surah={currentSurah}
          onBack={handleBackFromSurah}
          onPlay={() => playSurah(currentSurah)}
          isMarkedForMemorization={markedForMemorization.includes(currentSurah.number)}
          onToggleMemorization={() => toggleMemorization(currentSurah)}
        />
      ) : viewMode === 'juz' || viewMode === 'memorization' ? (
        renderJuzAccordion()
      ) : (
        renderSurahGrid()
      )}
      
      {/* Reciter selection modal */}
      <AnimatePresence>
        {showReciterModal && renderReciterModal()}
      </AnimatePresence>
      
      {/* Floating audio player */}
      <AnimatePresence>
        {currentSurah && renderAudioPlayer()}
      </AnimatePresence>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default EnhancedQuranContent;