import axios from 'axios';

// Base URLs for Quran API
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const QURAN_AUDIO_BASE = 'https://cdn.islamic.network/quran/audio-surah';
const MP3QURAN_API_BASE = 'https://www.mp3quran.net/api/v3';

// Create axios instance for Quran API
const quranApiClient = axios.create({
  baseURL: QURAN_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for MP3Quran API
const mp3QuranApiClient = axios.create({
  baseURL: MP3QURAN_API_BASE,
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
  
  // Get audio URL for a surah (Original method)
  getAudioUrl: (surahNumber, reciter = 'ar.alafasy', bitrate = '128') => {
    // Validate surah number
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('Invalid surah number. Must be between 1 and 114.');
    }
    
    // Check if reciter is a numeric ID (MP3Quran API) or string ID (Islamic Network API)
    if (!isNaN(reciter)) {
      // For MP3Quran reciters, construct URL directly without async call
      // Format the surah number with leading zeros if needed (e.g., 001, 023, 114)
      const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
      
      // Map reciter IDs to their server URLs
      const reciterServers = {
        '58': 'https://server8.mp3quran.net/buajan/',
        '98': 'https://server16.mp3quran.net/a_abdl/',
        '54': 'https://server11.mp3quran.net/sds/',
        '107': 'https://server8.mp3quran.net/lhdan/',
        '137': 'https://server16.mp3quran.net/a_binhameed/Rewayat-Hafs-A-n-Assem/'
      };
      
      if (!reciterServers[reciter]) {
        console.error(`Server URL not found for reciter ID ${reciter}`);
        // Fallback to default reciter
        return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/ar.alafasy/${surahNumber}.mp3`;
      }
      
      return `${reciterServers[reciter]}${formattedSurahNumber}.mp3`;
    }
    
    // Use the exact format from https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3
    return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${reciter}/${surahNumber}.mp3`;
  },
  
  // Get MP3Quran reciters
  getMp3QuranReciters: async () => {
    try {
      // Fetch all reciters
      const response = await mp3QuranApiClient.get('/reciters');
      return response.data.reciters;
    } catch (error) {
      console.error('Error fetching MP3Quran reciters:', error);
      throw error;
    }
  },
  
  // Get MP3Quran reciter by ID
  getMp3QuranReciterById: async (reciterId) => {
    try {
      const response = await mp3QuranApiClient.get(`/reciters?reciter=${reciterId}`);
      return response.data.reciters?.[0] || null;
    } catch (error) {
      console.error(`Error fetching MP3Quran reciter ${reciterId}:`, error);
      throw error;
    }
  },
  
  // Get audio URL from MP3Quran API
  getMp3QuranAudioUrl: async (surahNumber, reciterId) => {
    // Validate surah number
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('Invalid surah number. Must be between 1 and 114.');
    }
    
    try {
      // Fetch reciter data
      const reciter = await quranAPI.getMp3QuranReciterById(reciterId);
      
      if (!reciter || !reciter.moshaf || reciter.moshaf.length === 0) {
        throw new Error(`No mushaf found for reciter ${reciterId}`);
      }
      
      // Get the first moshaf (assuming it's the main one)
      const moshaf = reciter.moshaf[0];
      
      // Check if the surah is available for this reciter
      const surahList = moshaf.surah_list?.split(',').map(Number) || [];
      if (!surahList.includes(surahNumber)) {
        throw new Error(`Surah ${surahNumber} is not available for reciter ${reciter.name}`);
      }
      
      // Format the surah number with leading zeros if needed (e.g., 001, 023, 114)
      const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
      
      // Construct URL
      const audioUrl = `${moshaf.server}${formattedSurahNumber}.mp3`;
      
      return {
        url: audioUrl,
        reciterName: reciter.name,
        surahNumber: surahNumber
      };
    } catch (error) {
      console.error(`Error getting MP3Quran audio URL for surah ${surahNumber} by reciter ${reciterId}:`, error);
      throw error;
    }
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