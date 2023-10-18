# Use an official Node.js image with Alpine Linux as the base image
FROM node:18.18-alpine as frontend

# Install pnpm globally within the container
# Install pnpm
RUN npm install --global pnpm \
    && SHELL=bash pnpm setup \
    && source /root/.bashrc

# Set the working directory within the container
WORKDIR /code

# Copy all files from your current directory to the container's working directory
COPY . .

WORKDIR /code/apps/taxes/

# Install project dependencies using pnpm
RUN pnpm install

# # Generate the project (replace 'generate' with your actual build script)
# RUN pnpm generate

RUN pnpm run build
# Define the command to run your application
CMD ["pnpm", "start"]

# Expose a port if your application listens on a specific port (e.g., 3000)
EXPOSE 3000