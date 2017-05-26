// Keep calm and Functional Programming in NodeJS :D

const express = require('express')
const app = express();
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')

const api = require('./server/api')
const port = 80;

app.use(cors())
app.use(bodyParser.json())

app.listen(port, function () {
  console.log(`Server listening on port ${port}`)
});

/*
Before uncomment this block, run `ng build` first!
--------------------------------------------------

app.get('/', function (req, res) {
  res.sendfile(path.resolve('./dist/index.html'));
});

Else, run `ng serve`.
---------------------
*/

app.post('/chatting', function (req, res) {
  api.query(req, res);
})

app.post('/submit', (req, res) => {
  api.submit(req, res);
})
