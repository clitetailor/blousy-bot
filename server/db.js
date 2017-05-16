const secret = require('./secret')

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic(secret.username, secret.password));
const session = driver.session();

const tokenizer = require('./tokenizer');

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

  predictIllness(symptoms, exclusions) {

    return session.run(`
      MATCH (i: Illness) 
      RETURN i, count()
    `, { symptoms, exclusions })
      .then(result =>
        result.records.map(record => immu.assign(record.get('illness').properties, {
          id: record.get('illness').identity
        })))
      .catch(err => concols.error(err))
  }

  otherSymptoms(illnesses, symptoms, exclusions) {
    return session.run(`
      UNWIND {illnesses} AS illness
      MATCH (i: Illness), (s: Symptom), (e: Symptom)
      WHERE id(i) = illness.id
        AND (i)-[:SYMPTOM]->(s)
        AND id(s) NOT IN extract(es IN {symptoms} | es.id)
        AND (i)-[:SYMPTOM]->(e)
        AND id(e) NOT IN extract(ee IN {exclusions} | ee.id)
      RETURN
        i,
        count((i)-[:SYMPTOM]->(s)) - size((i)-[:SYMPTOM]->(e)) * 0.3 AS rank
      ORDER BY rank DESC LIMIT 5
      WITH i, rank
      MATCH (i)-[:SYMPTOM]->(o: Symptom)
      WHERE id(o) NOT IN extract(es IN {symptoms} | es.id)
      RETURN o, rank
    `, {
      illnesses,
      symptoms,
      exclusions: [] | exclusions
    })
      .then(result =>
        result.records.map(record => immu.assign(record.get('o').properties, {
          id: record.get('o').identity
        })))
      .catch(err => console.error(err))
  }

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
            LIMIT 1
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
              AND t.text = "triệu chứng"
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

module.exports = new DB();
