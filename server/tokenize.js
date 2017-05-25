function tokenize(str) {
  return str.split(/\?+|!+|\(+|\)+|\s+/)
    .filter(w => !w.match(/^\s*$/));
}

module.exports = tokenize;
