import axios from 'axios';

// Base URLs for Quran API
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const QURAN_AUDIO_BASE = 'https://cdn.islamic.network/quran/audio-surah';

// Create axios instance for Quran API
const quranApiClient = axios.create({
  baseURL: QURAN_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quranAPI = {
  // Get all surahs
  getAllSurahs: async (edition = 'en.asad') => {
    try {
      const response = await quranApiClient.get(`/surah`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  },
  
  // Search in the Quran
  searchQuran: async (keyword, surah = null, edition = 'en.asad') => {
    try {
      let url = `/search/${keyword}`;
      if (surah) {
        url += `/${surah}`;
      }
      url += `/${edition}`;
      
      const response = await quranApiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error searching Quran:', error);
      throw error;
    }
  },
  
  // Get audio URL for a surah
  getAudioUrl: (surahNumber, reciter = 'ar.alafasy', bitrate = '128') => {
    // Validate surah number
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('Invalid surah number. Must be between 1 and 114.');
    }
    
    // Use the exact format from https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3
    return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${reciter}/${surahNumber}.mp3`;
  },
  
  // Get a specific surah
  getSurah: async (surahNumber, edition = 'en.asad') => {
    try {
      const response = await quranApiClient.get(`/surah/${surahNumber}/${edition}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber}:`, error);
      throw error;
    }
  },
  
  // Get available audio editions
  getAudioEditions: async () => {
    try {
      const response = await quranApiClient.get('/edition/format/audio');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching audio editions:', error);
      throw error;
    }
  },
  
  // Get surah with translation
  getSurahWithTranslation: async (surahNumber, translationEdition = 'en.asad') => {
    try {
      const [originalResponse, translationResponse] = await Promise.all([
        quranApiClient.get(`/surah/${surahNumber}`),
        quranApiClient.get(`/surah/${surahNumber}/${translationEdition}`)
      ]);
      
      // Combine original and translation
      const original = originalResponse.data.data;
      const translation = translationResponse.data.data;
      
      // Merge the ayahs from both responses
      const mergedAyahs = original.ayahs.map((ayah, index) => ({
        ...ayah,
        translation: translation.ayahs[index].text
      }));
      
      return {
        ...original,
        ayahs: mergedAyahs
      };
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber} with translation:`, error);
      throw error;
    }
  },
  
  // Get available editions (translations, etc.)
  getEditions: async (language = null, format = null, type = null) => {
    try {
      let url = '/edition';
      
      // Add filters if provided
      if (format) url += `/format/${format}`;
      if (type) url += `/type/${type}`;
      if (language) url += `/language/${language}`;
      
      const response = await quranApiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching editions:', error);
      throw error;
    }
  },
  
  // Get Juz data (division of Quran into 30 parts)
  getJuz: async (juzNumber, edition = 'quran-uthmani') => {
    try {
      if (juzNumber < 1 || juzNumber > 30) {
        throw new Error('Invalid juz number. Must be between 1 and 30.');
      }
      
      const response = await quranApiClient.get(`/juz/${juzNumber}/${edition}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching juz ${juzNumber}:`, error);
      throw error;
    }
  },
  
  // Get Hizb data (division of Quran into 60 groups)
  getHizb: async (hizbNumber, edition = 'quran-uthmani') => {
    try {
      if (hizbNumber < 1 || hizbNumber > 60) {
        throw new Error('Invalid hizb number. Must be between 1 and 60.');
      }
      
      const response = await quranApiClient.get(`/hizbQuarter/${hizbNumber * 4 - 3}/${edition}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching hizb ${hizbNumber}:`, error);
      throw error;
    }
  },
  
  // Get all Quran structure metadata (surahs, juz, hizb info)
  getQuranMetadata: async () => {
    try {
      const response = await quranApiClient.get('/meta');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Quran metadata:', error);
      throw error;
    }
  },
  
  // Get page data (for displaying specific pages of the Quran)
  getPage: async (pageNumber, edition = 'quran-uthmani') => {
    try {
      const response = await quranApiClient.get(`/page/${pageNumber}/${edition}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      throw error;
    }
  }
};

export default quranAPI; 