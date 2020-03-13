FROM node:12.16.1
EXPOSE 4000
WORKDIR /usr/src/app

#Following installation is ommited since in test environment, they're installed manually
#RUN npm install -g nodemon node-gyp

COPY . ./
RUN rm -rf ./tests

# Create app directory
COPY package*.json ./
RUN npm install
