import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';

// Islamic geometric pattern background
const backgroundPattern = {
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23166534\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
};

// Islamic quotes for displaying on the login page
const islamicQuotes = [
  { text: "Wie geduldig is, zal zegevieren.", author: "Imam Ali" },
  { text: "Kennis leidt je van duisternis naar licht.", author: "Imam Al-Ghazali" },
  { text: "Het paradijs ligt aan de voeten van je moeder.", author: "Hadith" },
  { text: "Glimlachen naar je broeder is liefdadigheid.", author: "Hadith" },
  { text: "De sterkste onder jullie is degene die zichzelf kan beheersen in woede.", author: "Hadith" }
];

// Prayer times component for display
const PrayerTimes = () => {
  // This could be replaced with actual API data in a production app
  const prayerTimes = {
    fajr: "06:15",
    dhuhr: "13:30",
    asr: "16:45",
    maghrib: "18:30",
    isha: "20:15"
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-emerald-700 mb-2">Gebedslijden</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-emerald-800">Fajr</span>
          <span className="text-emerald-900 font-medium">{prayerTimes.fajr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-800">Dhuhr</span>
          <span className="text-emerald-900 font-medium">{prayerTimes.dhuhr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-800">Asr</span>
          <span className="text-emerald-900 font-medium">{prayerTimes.asr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-800">Maghrib</span>
          <span className="text-emerald-900 font-medium">{prayerTimes.maghrib}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-800">Isha</span>
          <span className="text-emerald-900 font-medium">{prayerTimes.isha}</span>
        </div>
      </div>
    </div>
  );
};

// Main login component
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  
  // Random quote selection on page load
  const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];

  // Check if user was redirected here due to an unauthorized request
  useEffect(() => {
    // Clear any error messages when component mounts
    setErrorMessage('');
    
    // Clear any old tokens that might be invalid
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      setErrorMessage('Je sessie is verlopen. Log opnieuw in om verder te gaan.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error message
    setErrorMessage('');
    
    // Prevent submitting if already loading
    if (loading) return;
    
    // Clear any potential token to ensure a fresh login attempt
    localStorage.removeItem('token');
    
    try {
      // Use a local variable to track this login attempt's success
      const loginSuccess = await login(email, password);
      
      // Only navigate if we got a successful response with a token
      if (loginSuccess && loginSuccess.token) {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Login failed:', error);
      setErrorMessage(error.response?.data?.message || 'Inloggen mislukt. Controleer je gegevens en probeer het opnieuw.');
      // No automatic redirect on error - user stays on login page
    }
  };

  return (
    <div 
      style={backgroundPattern}
      className="min-h-screen flex items-center justify-center bg-emerald-50 p-4"
    >
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-2xl">
        {/* Left panel - Decorative with quote */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 bg-gradient-to-br from-emerald-800 to-emerald-600 p-8 text-white flex flex-col"
        >
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6">Assalamualaikum</h1>
            <div className="mb-8">
              <blockquote className="border-l-4 border-white/50 pl-4 italic">
                <p className="text-xl mb-2">{randomQuote.text}</p>
                <footer className="text-sm">— {randomQuote.author}</footer>
              </blockquote>
            </div>
            
            <div className="mb-6">
              <PrayerTimes />
            </div>
          </div>
          
          <div className="text-sm opacity-80">
            © Familie Applicatie | {new Date().getFullYear()}
          </div>
        </motion.div>
        
        {/* Right panel - Login form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 bg-white p-8"
        >
          <div className="h-full flex flex-col justify-center">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800">Login bij uw account</h2>
              <p className="text-gray-600 mt-2">Voer uw gegevens in om toegang te krijgen</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="uw@email.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Wachtwoord
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bezig met inloggen...
                  </span>
                ) : 'Inloggen'}
              </button>
              
              {/* Display error message if there is one */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 