const immu = require('immu-func');
const session = require('./session')
const tokenize = require('../tokenize');
const getNode = require('./utils/get-node')

function query(sentence) {
  const words = tokenize(sentence);

  return session.run(`
        UNWIND {words} AS word
        MATCH (w: Word), (s: Sentence)-[:FUNCTION]->(f: Function)
        WHERE w.text = word
          AND ((w)-[:TOKEN]->(s)
              OR
              (w)-[:TOKEN]->(:Tag)-[:TOKEN]->(s))
        RETURN s AS sentence, count(w) AS rank, f AS function
        ORDER BY rank DESC
        limit 1
      `,
      { words }
    )
    .then(result => {
      return getNode(result.records[0], 'function')
    })
    .catch(err => console.error(err));
}

module.exports = query;
