const session = require('./session')
const tokenize = require('../tokenize');
const getNode = require('./getNode')

function getIllness(sentence) {
  const words = tokenize(sentence);

  return session.run(`
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
      { words }
    )
    .then(result => {
      return getNode(result.record[0], 'illness')
    })
    .catch(err => console.error(err))
}


function illnessSymtomps(illness) {
  return session.run(`
        MATCH (i: Illness}, (s: Symptom)
        WHERE (i)-[:Symptom]->(s)
          AND id(i) = {illness}.id
        RETURN s AS sentence
      `, { illness }
    )
    .then(result => {
      return result.records.map(record => {
        return getNode(record, 'sentence')
      })
    })
    .catch(err => console.error(err))
}


function listSymptoms(message) {
  return getIllness(message)
    .then(illness => {
      return illnessSymtomps(illness)
        .then(symptoms => {
          return {
            type: "list symptoms",
            illness, symptoms
          }
        })
    });
}


/*
These code require NodeJS version 7.8 or higher
-----------------------------------------------

async function listSymptoms(message) {
  const illness = getIllness(message)
  const symptoms = illnessSymtomps(illness)

  return { symptoms }
}
*/


module.exports = listSymptoms;
