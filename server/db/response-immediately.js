const session = require('./session')

const tokenizer = require('../tokenizer');

const immu = require('immu-func');
const fp = require('f-pipe');

class ResponseImmediately {
  responseImmediately(sentence) {
    return fp.select(sentence)
      .bulk([
        sentence => tokenizer.tokenize(sentence),

        words => session.run(`
          UNWIND {words} AS word
          MATCH (w: Word), (t: Tag), (s: Sentence)
          WHERE ((w)-[:TOKEN]->(t)-[:TOKEN]->(s)
                OR
                (w)-[:TOKEN]->(s))
            AND w.text = word
          WITH s, count(w) AS rank
          ORDER BY rank DESC
          LIMIT 1
          MATCH (s)-[:RESPONSE]->(res: Sentence)
          RETURN res
        `, { words })
        .then(result =>
          immu.assign(result.records[0].get('res').properties, {
            id: result.records[0].get('res').identity
          }))
        .catch(err => console.error(err))
      ])
      .get();
  }
}

module.exports = new ResponseImmediately();
