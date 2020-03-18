FROM node:12.16.1
EXPOSE 4000
WORKDIR /usr/src/app
COPY . ./
COPY package*.json ./
RUN rm -rf ./node_modules
RUN npm install -g nodemon node-gyp
RUN npm install
#RUN npm run migrate-mongo
