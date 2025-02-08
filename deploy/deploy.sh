#!/bin/bash

LOG_FILE="/home/pi/deploy.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Navigate to the directory where your repo is located (adjust the path as needed)
cd /home/pi/trainsapi

# Pull the latest changes from the GitHub repository
log_message "Pulling latest changes from GitHub..."
echo "Pulling latest changes from GitHub..."
git pull origin master

# Stop and remove any running container using the app name
log_message "Stopping existing container..."
echo "Stopping existing container..."
docker stop trainsapi || true  # Ignore errors if container isn't running
docker rm trainsapi || true    # Ignore errors if container doesn't exist

# Build the Docker image
log_message "Building Docker image..."
echo "Building Docker image..."
docker build -t trainsapi -f docker/Dockerfile .

# Run the Docker container
log_message "Running the Docker container..."
echo "Running the Docker container..."
docker run -d --name trainsapi -p 3000:3000 trainsapi

log_message "Deployment completed successfully!"
echo "Deployment completed successfully!"
