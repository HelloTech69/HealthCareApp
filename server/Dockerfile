# FROM node:slim

# RUN apt update && apt install curl -y

# # Declaring env
# ENV NODE_ENV development

# # # Declaring env
# # ENV NODE_ENV production

# # Setting up the work directory
# WORKDIR /app

# # Copy package.json and package-lock.json to the container
# # COPY package*.json ./

# # Copying all the files in our project
# COPY . .

# # Installing dependencies
# RUN npm install

# # Starting our application
# CMD [ "npm", "run", "start" ]

# # Exposing server port
# EXPOSE 3500

FROM node:slim

RUN apt update && apt install curl -y

# Declaring env
ENV NODE_ENV production

# Setting up the work directory
WORKDIR /app

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "npm", "run", "start" ]