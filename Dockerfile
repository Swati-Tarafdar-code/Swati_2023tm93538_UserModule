# Use the official Node.js image as a base
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose the app's port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]