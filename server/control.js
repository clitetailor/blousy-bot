const db = require('./db')

function control(func, req, res) {
  const { message } = req.body;

  if (func.type === "complex search") {
    if (func.name === "chuẩn đoán bệnh") {
      const { exclusions, symptoms }

      db.predictIllness(message)
        .then(res)

      return;
    }

    if (func.name === "liệt kê triệu chứng") {
      db.listSymptoms(message)
        .then(res)
    }
  }

  if (func.type === "response immediately") {
    db.responseImmediately[message]
      .then(res)
  }
}

module.exports = control;
