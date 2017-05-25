const query = require('./query')
const predictIllness = require('./predict-illness')
const listSymptoms = require('./list-symptoms')
const responseImmediately = require('./response-immediately')

module.exports = {
  query,
  predictIllness,
  listSymptoms,
  responseImmediately
}
