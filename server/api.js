const db = require('./db')
const tokenizer = require('./tokenizer')
const fp = require('f-pipe')

class API {
  query(socket) {
    return (message, info) =>
      fp.select(message)
        .bulk([
          message => db.query(message),

          promise =>
            promise.then(func => {
              console.log(func);

              if (func.type === "complex search") {
                if (func.name === "chuẩn đoán bệnh") {
                  this.predictIllness(socket)(message, info);
                }

                if (func.name === "liệt kê triệu chứng") {
                  return this.listSymptoms(socket)(message);
                }
              }

              if (func.type === "response immediately") {
                return this.responseImmediately(socket)(message);
              }
            })
        ]);
  }

  predictIllness(socket) {
    return (message, info) =>
      fp.select(message)
        .bulk([
          message => db.extractSymptoms(message, info.symptoms, info.exclusions),

          promise => promise
            .then(symptoms =>
              db.predictIllness(symptoms.concat(info.symptoms), info.exclusions))
            .then(ilnesses =>
              illnesses.map(illness =>
                db.findSymtomps(illness)
                  .then(symptoms => {
                    return { illness, symptoms }
                  })))
            .then(results => Promise.all(results))
            .then(results => {
              socket.emit('response', {
                time: new Date(),
                type: 'checkboxes',
                username: 'bot',
                content: results.map(result => {
                  return {
                    title: "bạn có mắc phải triệu chứng nào trong các triệu chứng sau hay không?",
                    checklist: {
                      content: result.symptom,
                    }
                  }
                })
              })
              socket.emit('live-result', results.map(result => {
                return {
                  title: result.illness,
                  list: result.symptoms
                }
              }))
            })
            .catch(err => console.error(err)),

          promise =>
            promise.then(result => {
              socket.emit('live-result', result)
            })
            .catch(err => console.error(err))
        ])
        .get()
  }

  listSymptoms(socket) {
    return message =>
      fp.select(message)
        .bulk([
          message => db.findIllness(message),

          promise =>
            promise.then(illness =>
              db.findSymtomps(illness)
                .then(symptoms => {
                  return {
                    type: 'chat-box',
                    time: new Date(),
                    content: `các triệu chứng của bệnh ${illness.name} là`,
                    list: symptoms.map(symptom =>
                      symptom.name),
                    username: 'bot'
                  }
                })),

          promise =>
            promise.then(response =>
              socket.emit('response', response))
        ])
  }

  responseImmediately(socket) {
    return message =>
      fp.select(message)
        .bulk([
          message => db.responseImmediately(message),

          promise =>
            promise.then(response => {
              return {
                type: 'chat-box',
                time: new Date(),
                content: response.text,
                username: 'bot'
              }
            }),

          promise =>
            promise.then(response =>
              socket.emit('response', response))
        ])
  }
}

module.exports = new API;
