// import express (after npm install express)
const express = require('express');
require('./register')
const { Capsule } = require('../../dist/capsule-http.cjs')

// create new express app and save it as "app"
const app = express();

// server configuration
const PORT = 8080;

// create a route for the app
app.get('/', async (req, res) => {
  console.info('enter get')
  const data = await Capsule.request('fetch.basic')
  return res.json(data);
});

// make the server listen to requests
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});