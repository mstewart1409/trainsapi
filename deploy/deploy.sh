#!/bin/bash

# Navigate to the directory where your repo is located (adjust the path as needed)
cd /home/pi/trainsapi

# Pull the latest changes from the GitHub repository
echo "Pulling latest changes from GitHub..."
git pull origin master

# Stop and remove any running container using the app name
echo "Stopping existing container..."
docker stop trainsapi || true  # Ignore errors if container isn't running
docker rm trainsapi || true    # Ignore errors if container doesn't exist

# Build the Docker image
echo "Building Docker image..."
docker build -t trainsapi -f docker/Dockerfile .

# Run the Docker container
echo "Running the Docker container..."
docker run -d --name trainsapi -p 3000:3000 trainsapi

echo "Deployment completed successfully!"
