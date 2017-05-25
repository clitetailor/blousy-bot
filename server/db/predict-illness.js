const session = require('./session')

const tokenizer = require('../tokenizer');

const immu = require('immu-func');
const fp = require('f-pipe');

class PredictIllness {

  predictIllness(symptoms, exclusions = []) {
    return session.run(`
      MATCH (s: Symptom)<-[:SYMPTOM]-(i: Illness), (e: Symptom)<-[:SYMPTOM]-(i)
      WHERE id(s) IN extract(symptom IN {symptoms} | symptom.id)
        AND NOT id(e) IN extract(symptom IN {exclusions} | symptom.id)
      RETURN i AS illness, count(s) - count(e) * 0.3 AS rank
    `, { symptoms, exclusions })
      .then(result => {
        return result.records.map(record => immu.assign(record.get('illness').properties, {
          id: record.get('illness').identity
        }))
      })
      .catch(err => console.error(err))
  }

  otherSymptoms(illnesses, symptoms = [], exclusions = []) {
    console.log(1, illnesses, 2, symptoms, 3, exclusions)

    return session.run(`
      UNWIND {illnesses} AS illness
      MATCH (i: Illness), (s: Symptom)
      WHERE id(i) = illness.id
        AND (i)-[:SYMPTOM]->(s)
        AND NOT id(s) IN extract(es IN {symptoms} | es.id)
        AND NOT id(s) IN extract(ee IN {exclusions} | ee.id)
      RETURN
        s AS symptom
      LIMIT 5
    `, {
      illnesses,
      symptoms,
      exclusions
    })
      .then(result =>
        result.records.map(record => immu.assign(record.get('symptom').properties, {
          id: record.get('symptom').identity
        })))
      .catch(err => console.error(err))
  }

  extractSymptoms(sentence) {
    return fp.select(sentence)
      .bulk([
        sentence => tokenizer.tokenize(sentence),

        words =>
          session.run(`
            MATCH (s: Symptom)
            WITH s
            MATCH (s)<-[:TOKEN]-(w: Word)-[:TOKEN]->(t: Tag)
            WHERE
              t.text = "triệu chứng"
              AND w.text IN {words}
            RETURN s AS symptom, count(w) AS rank
            ORDER BY rank DESC
            LIMIT 1
          `, { words })
          .then(result => result.records.map(record =>
            immu.assign(record.get('symptom').properties, {
              id: record.get('symptom').identity
            })))
      ])
      .get();
  }
}

module.exports = new PredictIllness();
