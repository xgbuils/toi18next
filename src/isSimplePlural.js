const isSimplePlural = (tokens) => {
    return tokens.length === 1 && tokens[0].type === 'plural';
}

module.exports = isSimplePlural;
