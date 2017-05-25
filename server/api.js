const query = require('./db/query')
const responseImmediately = require('./db/response-immediately')
const listSymptoms = require('./db/list-symptoms')
const predictIllness = require('./db/predict-illness')

const fp = require('f-pipe')

class API {
  query(socket) {
    return (message, info) =>
      fp.select(message)
        .bulk([
          message => query.query(message),

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

  addMoreInformation(socket) {
    return (symptoms, exclusions) =>
      fp.select({})
        .bulk([
          () => predictIllness.predictIllness(symptoms, exclusions)
        ])
  }

  predictIllness(socket) {
    return (message, info) =>
      fp.select(message)
        .bulk([
          message => predictIllness.extractSymptoms(message, info.symptoms, info.exclusions),

          promise => promise
            .then(symptoms => {
              return predictIllness.predictIllness(symptoms.concat(info.symptoms), info.exclusions)
            })
            .then(illnesses => {
              console.log(illnesses)
              return illnesses.map(illness =>
                listSymptoms.findSymtomps(illness)
                  .then(symptoms => {
                    return { illness, symptoms }
                  }))
                })
            .then(results => Promise.all(results))
            .then(results => {
              fp.select(results.reduce((pre, cur) => {
                  return {
                    illnesses: pre.illnesses.concat([cur.illness]),
                    symptoms: pre.symptoms.concat(cur.symptoms),
                    exclusions: pre.exclusions.concat(cur.exclusions)
                  }
                }, {
                  illnesses: [],
                  symptoms: [],
                  exclusions: []
                }))
                .then(result => {
                  promise.then(symptom => {

                    predictIllness.otherSymptoms(
                      result.illnesses
                    )
                    .then(otherSymptoms => {

                      if (otherSymptoms.length !== 0) {
                        socket.emit('response', {
                          time: new Date(),
                          type: 'checkboxes',
                          username: 'bot',
                          content: {
                            title: "bạn có mắc phải triệu chứng nào trong các triệu chứng sau hay không?",
                            checklist: otherSymptoms.map(o => o.name)
                              .map(symptom => {
                                return {
                                  content: symptom,
                                  checked: false
                                }
                              })
                          }
                        })
                      }
                      else {
                        socket.emit('response', {
                          time: new Date(),
                          type: 'chat-box',
                          username: 'bot',
                          content: "mình nghĩ kết quả tương đối chính xác rồi đó! :D"
                        })
                      }

                    })

                  })
                })

              socket.emit('live-result', results.map(result => {
                return {
                  title: result.illness.name,
                  list: result.symptoms.map(symptom => symptom.name)
                }
              }))
            })
            .catch(err => console.error(err))
        ])
        .get()
  }

  listSymptoms(socket) {
    return message =>
      listSymptoms.findIllness(message)
        .then(illness =>
          listSymptoms.findSymtomps(illness)
            .then(symptoms => {
              return {
                type: 'chat-box',
                time: new Date(),
                content: `các triệu chứng của bệnh ${illness.name} là`,
                list: symptoms.map(symptom =>
                  symptom.name),
                username: 'bot'
              }
            }))
        .then(response =>
          socket.emit('response', response))

  }

  responseImmediately(socket) {
    return message =>
      fp.select(message)
        .bulk([
          message => responseImmediately.responseImmediately(message),

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
