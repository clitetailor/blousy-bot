const db = require('./db')

function control(func, req, res) {
  const { message } = req.body;

  if (func.type === "complex search") {
    if (func.name === "chuẩn đoán bệnh") {
      const { exclusions, symptoms } = req.body;

      db.predictIllness(message)
        .then(result => res.json(result))

      return;
    }

    if (func.name === "liệt kê triệu chứng") {
      db.listSymptoms(message)
        .then(result => res.json(result))

      return;
    }
  }

  if (func.type === "response immediately") {
    db.responseImmediately(message)
      .then(result => res.json(result))

    return;
  }
}

module.exports = control;
