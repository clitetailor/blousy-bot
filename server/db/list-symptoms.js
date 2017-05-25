const session = require('./session')

const tokenizer = require('../tokenizer');

const immu = require('immu-func');
const fp = require('f-pipe');

class ListSymptoms {

  findIllness(sentence) {
    return fp.select(sentence)
      .bulk([
        sentence => tokenizer.tokenize(sentence),

        words =>
          session.run(`
            MATCH (i: Illness)
            WITH i
            MATCH (i)<-[:TOKEN]-(w: Word)-[:TOKEN]->(t: Tag)
            WHERE NOT (w = "bệnh")
              AND t.text = "bệnh"
              AND w.text IN {words}
            RETURN i AS illness, count(w) AS rank
            ORDER BY rank DESC
            LIMIT 3
          `,
          { words })
          .then(result =>
            result.records[0])
          .then(record => immu.assign(record.get('illness').properties, {
            id: record.get('illness').identity
          }))
          .catch(err => console.error(err))
      ])
      .get()
  }

  findSymtomps(illness) {
    return fp.select(illness)
      .bulk([
        illness => session.run(`
          MATCH (i: Illness), (s: Symptom)
          WHERE (i)-[:SYMPTOM]->(s)
            AND id(i) = {illness}.id
          RETURN s
        `,
        { illness })
        .then(result =>
          result.records.map(record =>
            immu.assign(record.get('s').properties, {
              id: record.get('s').identity
            })))
        .catch(err => console.error(err))
      ])
      .get();
  }
}

module.exports = new ListSymptoms();
