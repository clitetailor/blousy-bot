const immu = require('immu-func');

const session = require('./session')
const tokenizer = require('../tokenizer');
const utils = require('./utils')

function query(sentence) {
  const words = tokenizer.tokenize(sentence);

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
  `, { words })
    .then(result => {
      return utils.getNode(result.record[0], 'function')
    });
}

module.exports = query;
