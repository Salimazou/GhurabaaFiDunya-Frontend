import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Return true if token is expired
      return decoded.exp < currentTime;
    } catch (error) {
      // If there's an error decoding the token, consider it expired
      return true;
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            // Token is expired, clear it
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Try to get current user data
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
          } catch (error) {
            // If there was an error getting the user data, clear the token
            // but don't throw an error, just log the user out silently
            console.error('Failed to get current user data:', error);
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Set up a timer to check token expiration every minute
    // but don't trigger refresh/redirects from this interval
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Je sessie is verlopen. Log opnieuw in.', { id: 'session-expired' });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      // Verwijder 'anonymous' gebruikersdata
      clearUserLocalStorage('anonymous');
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      setUser(response);
      
      toast.success('Welkom terug!');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Fout bij het inloggen';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      // Verwijder 'anonymous' gebruikersdata
      clearUserLocalStorage('anonymous');
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      setUser(response);
      
      toast.success('Registratie succesvol!');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Fout bij het registreren';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Functie om localStorage items te scannen en gebruikersspecifieke items te verwijderen
  const clearUserLocalStorage = (userId = null) => {
    // Als er een userId is meegegeven, verwijder alle items met die specifieke userId
    // Anders verwijder alle items met herkenbare gebruikersgerelateerde patronen
    
    try {
      // Verzamel alle localStorage keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      
      // Filter en verwijder relevante keys
      keys.forEach(key => {
        // Verwijder specifieke userId gerelateerde items
        if (userId && key.includes(`_${userId}`)) {
          localStorage.removeItem(key);
        }
        
        // Verwijder items met herkenbare patronen
        if (
          key.includes('memorization_') || 
          key.includes('last_read_') || 
          key.includes('selected_reciter_') ||
          key.includes('completedSurahs') ||
          key.includes('memorizationSurahs')
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Logout function
  const logout = () => {
    // Haal eerst de huidige user ID op om die te gebruiken voor het verwijderen van data
    const userId = user?.id;
    
    // Verwijder de token
    localStorage.removeItem('token');
    
    // Verwijder alle gebruikersspecifieke items
    clearUserLocalStorage(userId);
    
    // Reset user state
    setUser(null);
    toast.success('U bent uitgelogd');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 