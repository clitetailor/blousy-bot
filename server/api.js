const db = require('./db')
const control = require('./control')

function query(req, res) {
  db.query(req.body.message)
    .then(func => { control(func, req, res) })
}

module.exports = { query }
