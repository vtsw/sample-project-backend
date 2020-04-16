const Https = require('https');
const QueryString = require('querystring');
const Path = require('path');
const URL = require('url');

const defaultGrantPermissionOptions = {
  hostname: 'oauth.zaloapp.com',
  port: 443,
  path: '/v3/permission',
  method: 'GET',
  protocol: 'https',
};

const createGrantPermissionLink = (appId, redirectUri, state = {}, httpOptions = defaultGrantPermissionOptions) => {
  const stateString = JSON.stringify(state);
  const queryString = QueryString.stringify({ app_id: appId, redirect_uri: redirectUri, state: stateString });
  const base = `${httpOptions.protocol}://${httpOptions.hostname}:${httpOptions.port}`
  const path = `${httpOptions.path}?${queryString}`;
  const url = `${base}/${path}`
  return url;
};

const sendMessage = (token, to, message) => {}

module.exports = {
  createGrantPermissionLink,
  sendMessage,
};





