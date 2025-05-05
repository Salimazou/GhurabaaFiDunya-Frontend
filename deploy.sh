#!/bin/bash

# Build for production
echo "Building for production..."
npm run build

# Output the configuration being used
echo "Using API URL: $(grep -o 'apiUrl: .*' src/config.js | head -1)"

echo "Build completed successfully!"
echo "The production build is available in the 'dist' folder"
echo "To deploy to your website, copy the contents of the 'dist' folder to your web server" 