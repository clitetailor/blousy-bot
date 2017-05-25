const db = require('./db')
const control = require('./control')

function query(req, res) {
  res.json(
    db.query(req.message)
      .then(func => { control(func, req, res) })
  )
}

module.exports = { query }
