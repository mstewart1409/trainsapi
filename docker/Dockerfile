# Step 1: Use a base image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your application files
COPY . .

# Step 6: Expose port and start the app
EXPOSE 3000
CMD ["npm", "start"]
