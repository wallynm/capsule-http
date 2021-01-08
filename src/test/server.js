// import express (after npm install express)
const express = require('express');
var bodyParser = require('body-parser')

require('./register')
const { Capsule } = require('../../dist/capsule-http.cjs')

// create new express app and save it as "app"
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// server configuration
const PORT = 8080;

// create a route for the app
app.get('/test', async (req, res) => {
  const data = await Capsule.request('fetch.basic')
  return res.json(data);
});

// create a route for the app
app.get('/error', async (req, res) => {
  // try {
  //   const data = await Capsule.request('fetch.error')
  //   return res.json(data.test.info);
  // } catch(err) {
    res.status(500).send({ 
      error: 'Something failed!',
      code: 500
    });
  // }
});

// make the server listen to requests
const appListen = app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = appListen