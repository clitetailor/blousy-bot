const immu = require('immu-func');

function getCollection(record, name) {
  return record.get(name)
    .map(node => immu.assign(node.properties, {
      id: node.identity
    }))
}

module.exports = getCollection;
