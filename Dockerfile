# Use the Node.js Alpine image as a base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Install axios
RUN npm install axios

# Install dotenv
RUN npm install dotenv

# Install firebase-admin
RUN npm install firebase-admin

# Install firebase-admin
RUN npm install moment

# Copy the application code to the container
COPY . .

# Expose any necessary ports (if your application requires it)
EXPOSE 8090

# Define the command to run the application
CMD ["node", "productivity_matrices.js"]