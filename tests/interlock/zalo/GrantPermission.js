const Https = require('https');
const QueryString = require('querystring');
const URL = require('url');

const { createGrantPermissionLink } = require('../../../http/zalo/zaloInterlock');

const mockedLink = 'https://oauth.zaloapp.com:443//v3/permission?app_id=1814035735943636488&redirect_uri=https%3A%2F%2Flocalhost%3A3000&state=%7B%7D';
describe('Test Zalo interlock - Grant Permission', () => {
  it('Should return no error when try to access grant permission link', async () => {
    const grantPermissionLink = createGrantPermissionLink('1814035735943636488', 'https://localhost:3000');
    expect(grantPermissionLink)
      .toBe(mockedLink);
  });

  it('Should return no error when try to access grant permission link', async () => {
    const urlWithStringQuery = URL.parse(mockedLink);
    const queries = QueryString.parse(urlWithStringQuery.query);
    console.log(queries);
  });
});
