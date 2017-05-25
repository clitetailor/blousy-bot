const session = require('./session')
const tokenizer = require('../tokenizer');
const immu = require('immu-func');
const getNode = require('./utils/getNode')


function symptomsToIllnesses(symptoms, exclusions = []) {
  return session.run(`
        MATCH
          (s: Symptom)<-[:SYMPTOM]-(i: Illness),
          (e: Symptom)<-[:SYMPTOM]-(i)
        WHERE
          id(s) IN extract(symptom IN {symptoms} | symptom.id)
          AND NOT id(e) IN extract(symptom IN {exclusions} | symptom.id)
        RETURN
          i AS illness,
          count(s) - count(e) * 0.3 AS rank
      `,
      { symptoms, exclusions }
    )
    .then(result => {
      return result.records.map(record => {
        return getNode(record, 'illness');
      })
    })
    .catch(err => console.error(err))
}


function findOtherSymptoms(illnesses, symptoms = [], exclusions = []) {
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
      `,
      {
        illnesses,
        symptoms,
        exclusions
      }
    )
    .then(result => {
      return result.records.map(record => {
        return getNode(record, 'symptom')
      })
    })
    .catch(err => console.error(err))
}


function getSymptoms(sentence) {
  const words = tokenize(sentence)

  return session.run(`
        MATCH (s: Symptom)
        WITH s
        MATCH (s)<-[:TOKEN]-(w: Word)-[:TOKEN]->(t: Tag)
        WHERE
          t.text = "triệu chứng"
          AND w.text IN {words}
        RETURN s AS symptom, count(w) AS rank
        ORDER BY rank DESC
        LIMIT 1
      `,
      { words }
    )
    .then(result => {
      return result.records.map(record => {
        return getNode(record, 'symptom')
      })
    })
    .catch(err => console.error(err))
}


function predictIllness(message, symptoms, exclusions) {
  return getSymptoms(message)
    .then(extractedSymptoms => {
      const allSymptoms = extractedSymptoms.concat(symptoms)

      return symptomsToIllnesses(allSymptoms, exclusions)
        .then(illnesses => {

          return findOtherSymptoms(illnesses, allSymptoms, exclusions)
            .then(otherSymptoms => {

              return {
                type: "predict illness",
                illnesses, otherSymptoms
              }
            })
        })
    })
}

module.exports = predictIllness;
