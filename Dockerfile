FROM node:12.16.1
EXPOSE 4000
WORKDIR /usr/src/app
RUN npm install -g node-gyp
COPY . ./
COPY package*.json ./
RUN rm -rf ./node_modules
RUN npm install
