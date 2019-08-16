const isSimplePlural = (tokens) => {
    return tokens.length === 1 && tokens[0].type.startsWith('plural');
}

module.exports = isSimplePlural;
