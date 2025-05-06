/**
 * Service for fetching and managing prayer times
 * Uses the Aladhan API: https://aladhan.com/prayer-times-api
 */

const API_BASE_URL = 'https://api.aladhan.com/v1';

class PrayerTimesService {
  /**
   * Fetch prayer times for a specific date and location
   * 
   * @param {Date} date - Date to get prayer times for
   * @param {Object} location - Location information
   * @param {number} location.latitude - Latitude
   * @param {number} location.longitude - Longitude
   * @returns {Promise<Object>} - Prayer times data
   */
  static async getPrayerTimes(date, location) {
    const formattedDate = this.formatDate(date);
    
    try {
      const url = `${API_BASE_URL}/timings/${formattedDate}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.formatPrayerTimesResponse(data, date);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  }
  
  /**
   * Get prayer times for the current month
   * 
   * @param {Object} location - Location information
   * @param {number} location.latitude - Latitude
   * @param {number} location.longitude - Longitude
   * @param {number} month - Month (1-12)
   * @param {number} year - Year (e.g., 2023)
   * @returns {Promise<Array>} - Array of prayer times for each day
   */
  static async getMonthlyPrayerTimes(location, month, year) {
    try {
      const url = `${API_BASE_URL}/calendar/${year}/${month}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch monthly prayer times: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.formatMonthlyPrayerTimesResponse(data);
    } catch (error) {
      console.error('Error fetching monthly prayer times:', error);
      throw error;
    }
  }
  
  /**
   * Format date to YYYY-MM-DD format required by the API
   * 
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  static formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }
  
  /**
   * Format prayer times response into a more usable format for the app
   * 
   * @param {Object} response - API response
   * @param {Date} date - Original date requested
   * @returns {Object} - Formatted prayer times data
   */
  static formatPrayerTimesResponse(response, date) {
    if (!response.data || !response.data.timings) {
      throw new Error('Invalid prayer times response format');
    }
    
    const { timings } = response.data;
    const dateStr = date.toISOString().split('T')[0];
    
    // Convert prayer times to proper Date objects and create agenda-compatible events
    return {
      fajr: this.createPrayerEvent('Fajr', timings.Fajr, dateStr),
      sunrise: this.createPrayerEvent('Sunrise', timings.Sunrise, dateStr),
      dhuhr: this.createPrayerEvent('Dhuhr', timings.Dhuhr, dateStr),
      asr: this.createPrayerEvent('Asr', timings.Asr, dateStr),
      maghrib: this.createPrayerEvent('Maghrib', timings.Maghrib, dateStr),
      isha: this.createPrayerEvent('Isha', timings.Isha, dateStr),
      rawData: response.data
    };
  }
  
  /**
   * Format monthly prayer times response
   * 
   * @param {Object} response - API response
   * @returns {Array} - Array of daily prayer times
   */
  static formatMonthlyPrayerTimesResponse(response) {
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid monthly prayer times response format');
    }
    
    return response.data.map(day => {
      const dateStr = day.date.gregorian.date;
      const formattedDate = dateStr.split('-').reverse().join('-');
      
      return {
        date: formattedDate,
        fajr: this.createPrayerEvent('Fajr', day.timings.Fajr, formattedDate),
        sunrise: this.createPrayerEvent('Sunrise', day.timings.Sunrise, formattedDate),
        dhuhr: this.createPrayerEvent('Dhuhr', day.timings.Dhuhr, formattedDate),
        asr: this.createPrayerEvent('Asr', day.timings.Asr, formattedDate),
        maghrib: this.createPrayerEvent('Maghrib', day.timings.Maghrib, formattedDate),
        isha: this.createPrayerEvent('Isha', day.timings.Isha, formattedDate),
      };
    });
  }
  
  /**
   * Create a prayer event object compatible with the agenda
   * 
   * @param {string} name - Prayer name
   * @param {string} time - Prayer time in 24hr format (HH:MM)
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {Object} - Prayer event object
   */
  static createPrayerEvent(name, time, dateStr) {
    // Clean time format - API returns time with (EET) or other timezone indicators
    const cleanTime = time.split(' ')[0];
    
    // Create start time
    const startTime = new Date(`${dateStr}T${cleanTime}`);
    
    // End time is 30 minutes after start
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    return {
      id: `prayer-${name}-${dateStr}`,
      title: `${name} Prayer`,
      description: `Time for ${name} prayer`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      category: 'prayer',
      isReadOnly: true,
    };
  }
  
  /**
   * Get user's current location
   * 
   * @returns {Promise<Object>} - Location object with latitude and longitude
   */
  static getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Mecca as fallback
          resolve({
            latitude: 21.4225,
            longitude: 39.8262
          });
        }
      );
    });
  }
}

export default PrayerTimesService; 