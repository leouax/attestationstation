// lib/fetch.js
import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';
import https from 'https';

const agent = new HttpsProxyAgent({
  rejectUnauthorized: false, // This will ignore SSL certificate errors
});

const customFetch = (url, options) =>
  fetch(url, { ...options, agent });

export default customFetch;