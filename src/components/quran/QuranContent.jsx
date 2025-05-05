import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuranFilter from './QuranFilter';
import QuranAudioPlayer from './QuranAudioPlayer';
import quranAPI from '../../services/quranAPI';

const FILTER_TYPES = {
  SURAH: 'surah',
  JUZ: 'juz',
  HIZB: 'hizb'
};

const QuranContent = () => {
  const [filter, setFilter] = useState({ type: FILTER_TYPES.SURAH, value: null });
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAudioSurah, setCurrentAudioSurah] = useState(null);
  
  // Load content based on filter
  useEffect(() => {
    const fetchContent = async () => {
      if (!filter.value) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let data;
        switch (filter.type) {
          case FILTER_TYPES.SURAH:
            data = await quranAPI.getSurahWithTranslation(filter.value);
            break;
          case FILTER_TYPES.JUZ:
            data = await quranAPI.getJuz(filter.value);
            break;
          case FILTER_TYPES.HIZB:
            data = await quranAPI.getHizb(filter.value);
            break;
          default:
            throw new Error('Invalid filter type');
        }
        
        setContent(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(`Failed to load ${filter.type} content`);
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [filter]);
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handlePlayAudio = (surah) => {
    setCurrentAudioSurah(surah);
  };
  
  const handleCloseAudio = () => {
    setCurrentAudioSurah(null);
  };
  
  // Render content based on filter type
  const renderContent = () => {
    if (!content) {
      return (
        <div className="text-center p-8 text-gray-500">
          <p>Select a {filter.type} to view content</p>
        </div>
      );
    }
    
    // For Surah filter, we display the surah content
    if (filter.type === FILTER_TYPES.SURAH) {
      return (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{content.englishName}</h1>
              <p className="text-gray-600">{content.englishNameTranslation}</p>
              <p className="text-sm text-gray-500 mt-1">{content.revelationType} • {content.numberOfAyahs} verses</p>
            </div>
            <button
              onClick={() => handlePlayAudio(content)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Play Audio
            </button>
          </div>
          
          <div className="space-y-6">
            {content.ayahs.map((ayah) => (
              <div key={ayah.number} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                    {ayah.numberInSurah}
                  </span>
                </div>
                <p className="text-right font-arabic text-xl leading-loose mb-3" dir="rtl">{ayah.text}</p>
                <p className="text-gray-700">{ayah.translation}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // For Juz and Hizb filters
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {filter.type === FILTER_TYPES.JUZ ? `Juz ${filter.value}` : `Hizb ${filter.value}`}
        </h1>
        
        <div className="space-y-6">
          {content.ayahs.map((ayah) => (
            <div key={ayah.number} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                    {ayah.numberInSurah}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Surah {ayah.surah.englishName} ({ayah.surah.number})
                  </span>
                </div>
              </div>
              <p className="text-right font-arabic text-xl leading-loose mb-3" dir="rtl">{ayah.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <QuranFilter onFilterChange={handleFilterChange} initialFilterType={filter.type} />
      
      <div className="bg-gray-50 rounded-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 rounded-full border-3 border-gray-300 border-t-emerald-600 animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading content...</span>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-emerald-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      
      {currentAudioSurah && (
        <QuranAudioPlayer 
          surah={currentAudioSurah} 
          onClose={handleCloseAudio} 
        />
      )}
    </div>
  );
};

export default QuranContent; 