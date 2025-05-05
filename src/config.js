// Configuration for different environments
const config = {
  // Default to production values
  apiUrl: import.meta.env.VITE_API_BASE,
  
  // If in development environment (Vite sets this automatically)
  development: {
    apiUrl: 'http://localhost:5234/api',
  }
};

// Export the appropriate configuration based on environment
export default {
  // If we're in development mode, use development config, otherwise use production (default)
  apiUrl: import.meta.env.DEV ? config.development.apiUrl : config.apiUrl,
}; 