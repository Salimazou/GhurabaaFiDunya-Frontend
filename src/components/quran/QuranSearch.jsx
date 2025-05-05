import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  ArrowLongRightIcon 
} from '@heroicons/react/24/outline';
import quranAPI from '../../services/quranAPI';

const QuranSearch = ({ onSelectResult, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surahFilter, setSurahFilter] = useState('');
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await quranAPI.searchQuran(
        searchTerm, 
        surahFilter ? parseInt(surahFilter) : null
      );
      
      setResults(searchResults.matches || []);
    } catch (err) {
      console.error('Error searching Quran:', err);
      setError('Error searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting a search result
  const handleSelectResult = (result) => {
    if (onSelectResult) {
      onSelectResult({
        number: result.surah.number,
        name: result.surah.name,
        englishName: result.surah.englishName,
        numberOfAyahs: result.surah.numberOfAyahs,
        englishNameTranslation: result.surah.englishNameTranslation,
        revelationType: result.surah.revelationType
      });
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  const highlightText = (text, term) => {
    if (!term) return text;
    
    // Simple highlight implementation
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 rounded-sm px-0.5">$1</mark>');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-emerald-700 text-white">
        <h3 className="text-lg font-medium">Search Quran</h3>
      </div>
      
      <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words or phrases"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              loading || !searchTerm.trim() 
                ? 'bg-emerald-300 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="surahFilter" className="block text-sm font-medium text-gray-700 mr-2">
            Filter by Surah:
          </label>
          <input
            type="number"
            id="surahFilter"
            value={surahFilter}
            onChange={(e) => setSurahFilter(e.target.value)}
            min="1"
            max="114"
            placeholder="Surah #"
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-20 sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </form>
      
      <div className="max-h-60 overflow-y-auto p-2">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {!loading && results.length === 0 && searchTerm.trim() && !error && (
          <div className="p-4 text-sm text-gray-500 text-center">
            No results found. Try different keywords or filters.
          </div>
        )}
        
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={`${result.surah.number}-${result.numberInSurah}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectResult(result)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center text-sm text-emerald-700 font-medium">
                  <span>
                    Surah {result.surah.number}: {result.surah.englishName}
                  </span>
                  <ArrowLongRightIcon className="h-4 w-4 mx-1" />
                  <span>Ayah {result.numberInSurah}</span>
                </div>
                
                <span className="text-xs text-gray-500">
                  {result.surah.revelationType}
                </span>
              </div>
              
              <div 
                className="text-sm text-gray-600 mt-1"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(result.text, searchTerm) 
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {results.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
};

export default QuranSearch; 