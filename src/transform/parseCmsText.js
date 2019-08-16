const isSimplePlural = require('./isSimplePlural');

const isSpecialCase = (tokens, currentArgs, args) => {
    return isSimplePlural(tokens) && currentArgs.length === 1 && args.length <= 1;
};

intCompare = (a, b) => a - b;

const ArgsReplacer = (args, cmsText) => {
    let indexes = new Set();
    return {
        replace(text) {
            const vars = new Set();
            const replacedText = text.replace(/%(\d+)\$s/g, (match, num) => {
                const index = parseInt(num);
                const arg = args[index - 1];
                indexes.add(index);
                vars.add(arg);
                return index <= args.length ? `{{${arg}}}` : match;
            });
            return {
                value: replacedText,
                vars,
            };
        },
        validate(tokens) {
            const size = indexes.size;
            const sortedIndexes = [...indexes].sort(intCompare);
            const missing = [];
            const maxVar = sortedIndexes.slice(-1)[0];
            for (let index = 1; index <= maxVar; ++index) {
                if (!indexes.has(index)) {
                    missing.push(`%${index}$s`);
                }
            }
            const currentArgs = sortedIndexes.map((index) => `%${index}$s`);
            if (missing.length > 0) {                
                throw new Error(
                    `CMS text "${cmsText}" is missing some intermediate arguments:\n`
                    + `current arguments: ${currentArgs.join(', ')}\n`
                    + `missing arguments: ${missing.join(', ')}\n`
                );
            }
            if (!isSpecialCase(tokens, currentArgs, args) && currentArgs.length !== args.length) {
                const configArgs = args.map((arg) => `'${arg}'`);
                throw new Error(
                    `CMS text "${cmsText}" does not have the same number of arguments as configuration:\n`
                    + `${currentArgs.length} CMS text arguments: ${currentArgs.join(', ')}.\n`
                    + `${configArgs.length} configuration arguments: {args: [${configArgs.join(', ')}]}.\n`
                );
            }
        },
    };
};

const pluralRegExp = /\$\[_pl0?\((.+?)\)\]/g;

const trimPlural = (plural) => {
    return plural
        .replace(/^\$\[_pl0?\(/, '')
        .replace(/\)\]$/, '');
};

const getPluralType = (plural) => {
    return plural.startsWith('$[_pl0') ? 'pluralZero' : 'plural';
};

const TokensBuilder = (argsReplacer) => {
    const tokens = [];
    return {
        pushText(value) {
            if (value) {
                tokens.push({
                    ...argsReplacer.replace(value),
                    type: 'text',
                })
            }
        },
        pushPlural(value) {
            tokens.push({
                ...argsReplacer.replace(trimPlural(value)),
                type: getPluralType(value),
            })
        },
        build() {
            argsReplacer.validate(tokens);
            return tokens;
        }
    }
};

const parseCmsText = (text, args = []) => {
    const argsReplacer = ArgsReplacer(args, text);
    const tokensBuilder = TokensBuilder(argsReplacer);
    let previousIndex = 0;
    while(true) {
        const result = pluralRegExp.exec(text);
        if (!result) {
            tokensBuilder.pushText(text.substring(previousIndex));
            break;
        }
        const [match, pluralForms] = result;
        tokensBuilder.pushText(text.substring(previousIndex, result.index));
        tokensBuilder.pushPlural(match);
        previousIndex = result.index + match.length;
    }
    return tokensBuilder.build();
};

module.exports = parseCmsText;
