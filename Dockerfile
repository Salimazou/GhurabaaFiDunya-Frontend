# Gebruik een Node.js image voor het bouwen van de app
FROM node:18 AS build

# Zet de werkmap naar /app
WORKDIR /app

# Kopieer package.json en package-lock.json (indien aanwezig) voor de npm install
COPY package*.json ./

# Installeer de dependencies
RUN npm install

# Kopieer de rest van de applicatie code naar de container
COPY . .

# Bouw de app voor productie
RUN npm run build

# Gebruik een Nginx image om de gecompileerde bestanden te serveren
FROM nginx:alpine

# Kopieer de gebouwde bestanden naar de juiste map van Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose poort 80 zodat Nginx toegankelijk is
EXPOSE 80

# Start Nginx in de achtergrond
CMD ["nginx", "-g", "daemon off;"]
