const db = require('./db')
const control = require('./control')

function query(req, res) {
  db.query(req.body.message)
    .then(func => { control(func, req, res) })
}

function submit(req, res) {
  db.submit(req.body.symptoms, req.body.exclusions)
    .then(response => {
      res.json(response)
    })
    .catch(err => console.error(err))
}

module.exports = { query, submit }
