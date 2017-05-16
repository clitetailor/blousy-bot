class Tokenizer {
  tokenize(str) {
    return str.split(/\?+|!+|\(+|\)+|\s+/)
      .filter(w => !w.match(/^\s*$/));
  }
}

module.exports = new Tokenizer()
