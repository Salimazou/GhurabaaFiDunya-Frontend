import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import quranAPI from '../../services/quranAPI';

const FILTER_TYPES = {
  SURAH: 'surah',
  JUZ: 'juz',
  HIZB: 'hizb'
};

const QuranFilter = ({ onFilterChange, initialFilterType = FILTER_TYPES.SURAH }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [selectedValue, setSelectedValue] = useState(null);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Generate options for juz (1-30)
  const juzOptions = Array.from({ length: 30 }, (_, i) => ({ 
    number: i + 1, 
    name: `Juz ${i + 1}` 
  }));
  
  // Generate options for hizb (1-60)
  const hizbOptions = Array.from({ length: 60 }, (_, i) => ({ 
    number: i + 1, 
    name: `Hizb ${i + 1}` 
  }));
  
  // Fetch surahs on component mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const data = await quranAPI.getAllSurahs();
        setSurahs(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching surahs for filter:', err);
        setError('Failed to load surahs');
        setLoading(false);
      }
    };
    
    fetchSurahs();
  }, []);
  
  // Handle filter type change
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setSelectedValue(null);
  };
  
  // Handle filter value selection
  const handleSelectValue = (value) => {
    setSelectedValue(value);
    onFilterChange({
      type: filterType,
      value: value
    });
    setIsOpen(false);
  };
  
  // Get current options based on filter type
  const getCurrentOptions = () => {
    switch (filterType) {
      case FILTER_TYPES.SURAH:
        return surahs;
      case FILTER_TYPES.JUZ:
        return juzOptions;
      case FILTER_TYPES.HIZB:
        return hizbOptions;
      default:
        return [];
    }
  };
  
  // Get display name for selected value
  const getSelectedDisplayName = () => {
    if (!selectedValue) return 'Select...';
    
    switch (filterType) {
      case FILTER_TYPES.SURAH:
        const surah = surahs.find(s => s.number === selectedValue);
        return surah ? `${surah.number}. ${surah.englishName}` : 'Select Surah';
      case FILTER_TYPES.JUZ:
        return `Juz ${selectedValue}`;
      case FILTER_TYPES.HIZB:
        return `Hizb ${selectedValue}`;
      default:
        return 'Select...';
    }
  };
  
  return (
    <div className="relative">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Filter: {getSelectedDisplayName()}</span>
        </button>
      </div>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-40 mt-1 bg-white rounded-md shadow-lg border border-gray-200 w-72 md:w-96"
        >
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Filter Quran Content</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          
          {/* Filter Type Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleFilterTypeChange(FILTER_TYPES.SURAH)}
              className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center ${
                filterType === FILTER_TYPES.SURAH 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpenIcon className="h-4 w-4 mr-1" />
              Surah
            </button>
            <button
              onClick={() => handleFilterTypeChange(FILTER_TYPES.JUZ)}
              className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center ${
                filterType === FILTER_TYPES.JUZ 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Juz
            </button>
            <button
              onClick={() => handleFilterTypeChange(FILTER_TYPES.HIZB)}
              className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center ${
                filterType === FILTER_TYPES.HIZB 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Hizb
            </button>
          </div>
          
          {/* Options List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : (
              getCurrentOptions().map((option) => (
                <button
                  key={option.number}
                  onClick={() => handleSelectValue(option.number)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                    selectedValue === option.number ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                  }`}
                >
                  <span>
                    {filterType === FILTER_TYPES.SURAH 
                      ? `${option.number}. ${option.englishName}` 
                      : option.name
                    }
                    {filterType === FILTER_TYPES.SURAH && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({option.englishNameTranslation})
                      </span>
                    )}
                  </span>
                  {selectedValue === option.number && (
                    <CheckIcon className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuranFilter; 