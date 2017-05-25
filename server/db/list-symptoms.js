const session = require('./session')
const tokenize = require('../tokenize');
const getNode = require('./utils/get-node')

function getIllness(sentence) {
  const words = tokenize(sentence);

  return session.run(`
        MATCH (i: Illness)<-[:TOKEN]-(w: Word)-[:TOKEN]->(t: Tag)
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
      return getNode(result.records[0], 'illness')
    })
    .catch(err => console.error(err))
}


function illnessSymtomps(illness) {
  return session.run(`
        MATCH (i: Illness)-[:SYMPTOM]->(s: Symptom)
        WHERE id(i) = {illness}.id
        RETURN s AS symptom
      `, { illness }
    )
    .then(result => {
      return result.records.map(record => {
        return getNode(record, 'symptom')
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
