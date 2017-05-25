const session = require('./session')

const tokenizer = require('../tokenizer');

const immu = require('immu-func');
const fp = require('f-pipe');

class DB {
  query(sentence) {
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
      .then(result => immu.assign(result.records[0].get('function').properties, {
        id: result.records[0].get('function').identity
      }));
  }
}

module.exports = new DB();
