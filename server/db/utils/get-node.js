const immu = require('immu-func');

function getNode(record, name) {
  const node = record.get(name);

  return immu.assign(
    node.properties, {
      id: node.identity
    })
}

module.exports = getNode;
