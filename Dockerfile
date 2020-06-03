FROM mhart/alpine-node:12.16.1
EXPOSE 4000
EXPOSE 80

## caching npm modules installation
RUN mkdir -p /tmp/npm/
ADD package.json /tmp/npm/
RUN cd /tmp/npm/ && npm install -g node-gyp && npm install

## copy sources
WORKDIR /usr/src/app
COPY . ./
RUN rm -rf ./node_modules
RUN cp -a /tmp/npm/node_modules /usr/src/app/
