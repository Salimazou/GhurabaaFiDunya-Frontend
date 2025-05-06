import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  XMarkIcon,
  SpeakerWaveIcon,
  MinusIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/solid';
import quranAPI from '../../services/quranAPI';

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

const QuranAudioPlayer = ({ 
  surah,
  onClose,
  audioIdentifier = 'ar.alafasy',
  bitrate = '128'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState(audioIdentifier);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const audioRef = useRef(null);
  
  // Initialize audio when surah or reciter changes
  useEffect(() => {
    if (surah) {
      try {
        setLoading(true);
        setError(null);
        
        const audioUrl = quranAPI.getAudioUrl(surah.number, selectedReciter, bitrate);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
      } catch (err) {
        console.error('Error loading audio:', err);
        setError('Could not load audio');
        setLoading(false);
      }
    }
  }, [surah, selectedReciter, bitrate]);
  
  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    
    const handleLoadedData = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e) => {
      console.error('Audio error:', e);
      setError('Error playing audio');
      setLoading(false);
      setIsPlaying(false);
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      // Remove event listeners
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Format time (seconds) to mm:ss
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
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
  
  // Add handleReciterChange function
  const handleReciterChange = (e) => {
    const newReciter = e.target.value;
    setSelectedReciter(newReciter);
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };
  
  if (!surah) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 inset-x-0 p-4 z-50"
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          // Minimized player
          <motion.div 
            key="mini-player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-sm mx-auto bg-white rounded-lg shadow-lg p-3 border border-gray-200 flex items-center justify-between"
          >
            <div className="flex items-center">
              <button
                onClick={togglePlay}
                className={`p-2 rounded-full mr-3 ${
                  isPlaying ? 'bg-red-500' : 'bg-emerald-500'
                } text-white`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : isPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </button>
              <div>
                <p className="font-medium text-sm truncate max-w-[120px]">{surah.englishName}</p>
                <div className="flex items-center">
                  <div 
                    className="w-20 h-1 bg-gray-200 rounded-full mr-2 relative overflow-hidden"
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimized}
                className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Expand player"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Close audio player"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          // Full player
          <motion.div 
            key="full-player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-5 border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-4">
                <h3 className="font-medium text-emerald-800 text-lg">{surah.englishName}</h3>
                <p className="text-sm text-slate-500">{surah.englishNameTranslation}</p>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={toggleMinimized}
                  className="p-1.5 mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Minimize audio player"
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Close audio player"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Reciter selection */}
            <div className="mb-5 flex items-center justify-center bg-slate-50 p-2 rounded-lg">
              <SpeakerWaveIcon className="h-5 w-5 text-emerald-600 mr-2" />
              <select 
                value={selectedReciter}
                onChange={handleReciterChange}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                disabled={loading}
              >
                {RECITERS.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Progress bar */}
            <div 
              className="h-2.5 bg-slate-200 rounded-full mb-4 relative cursor-pointer overflow-hidden hover:shadow-sm transition-shadow"
              onClick={handleProgressClick}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
              <div
                className="absolute inset-y-0 bg-emerald-300 opacity-25 rounded-full"
                style={{ width: `${(currentTime / duration) * 100 + 4}%`, maxWidth: '100%' }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium text-slate-500">{formatTime(currentTime)}</span>
              <span className="text-xs font-medium text-slate-500">{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => jumpTime(-10)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Jump 10 seconds back"
              >
                <BackwardIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={loading || error}
                className={`p-4 rounded-full transition-all ${
                  loading ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg hover:scale-105'
                }`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {loading ? (
                  <div className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin"></div>
                ) : isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              
              <button
                onClick={() => jumpTime(10)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Jump 10 seconds forward"
              >
                <ForwardIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center justify-center mt-2 bg-slate-50 p-2 rounded-lg">
              <SpeakerWaveIcon className="h-4 w-4 text-slate-500 mr-3" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-36 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg">
                {error}. Please try again or try a different audio source.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" className="hidden" />
    </motion.div>
  );
};

export default QuranAudioPlayer; 