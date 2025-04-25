FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Install nodemon globally
RUN npm install -g nodemon

COPY . .

EXPOSE 5000

# Use nodemon for hot reload
CMD ["nodemon", "--legacy-watch", "index.js"]
