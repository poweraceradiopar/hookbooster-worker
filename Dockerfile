# Base image
FROM node:18

# Install ffmpeg, python3, pip
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    pip3 install --upgrade pip && \
    pip3 install yt-dlp

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "worker.js"]