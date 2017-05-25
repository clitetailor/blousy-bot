const session = require('./session')
const tokenize = require('../tokenize');
const getNode = require('./utils/get-node')


function responseImmediately(message) {
  const words = tokenize(message)

  console.log(message)

  return session.run(`
        UNWIND {words} AS word
        MATCH (w: Word), (t: Tag), (s: Sentence)
        WHERE
            ((w)-[:TOKEN]->(t)-[:TOKEN]->(s)
            OR
            (w)-[:TOKEN]->(s))
          AND
            w.text = word
        WITH
          s,
          count(w) AS rank
        ORDER BY rank DESC
        LIMIT 1
        MATCH (s)-[:RESPONSE]->(res: Sentence)
        RETURN res AS response
      `,
      { words }
    )
    .then(result => {
      const response = getNode(result.records[0], 'response')

      return {
        type: 'response immediately',
        message: response.text
      }
    })
    .catch(err => console.error(err))
}

module.exports = responseImmediately;
