const i18next = require('i18next');
const isSimplePlural = require('./isSimplePlural');
const parseCmsText = require('./parseCmsText');

i18next.init();

const getSuffixes = (lang) => {
    const rule = i18next.services.pluralResolver.getRule(lang);
    return rule.numbers.length === 2
        ? ['', '_plural']
        : Object.keys(rule.numbers).map(index => `_${index}`);
}

const i18nextVarRegExp = /^\{\{(.+?)\}\}$/;

const getVariable = (text, variables, num) => {
    const index = parseInt(num) - 1;
    if (index >= variables.length) {
        throw Error(
            'The key with content "${text}" should have ' +
            `at least ${num} defined arguments. However ` +
            `it is just defined ${variables.length} arguments.`
        )
    }
}

const PluralSupplier = (plurals = [], defaultValue) => {
    let index = 0;
    return {
        get() {
            return plurals[index++] || defaultValue
        }
    }
}

const formatVariablesInPluralExpr = (variables, pluralVar, pluralName) => {
    const variablesObject = [...variables]
        .map((variable) => {
            return variable === pluralVar
                ? `count: {{${variable}}}`
                : `${variable}: {{${variable}}}`;
        })
        .join(', ');
    return `$t(${pluralName}, {${variablesObject}})`;
}

const createMainText = ({tokens, plurals, outputName}) => {
    if (isSimplePlural(tokens)) {
        return {};
    }
    const pluralSupplier = PluralSupplier(plurals);
    const mainKeyText = tokens.map(({value, type, vars}) => {
        if (type === 'text') {
            return value;
        }
        const [variable, ...pluralForms] = value.split('|');
        const result = variable.match(i18nextVarRegExp);
        const [, pluralVar] = result;
        if (!pluralVar) {
            throw new Error(`Plural expression doesn't have a variable expressions as first argument: ${value}`);
        }
        const pluralName = pluralSupplier.get();
        return formatVariablesInPluralExpr(vars, pluralVar, pluralName)
    }).join('')
    return {
        [outputName]: mainKeyText,
    }
}

const replaceText = (text, needle, replacement) => {
    let previousIndex = 0;
    let result = '';
    while(true) {
        const index = text.indexOf(needle, previousIndex);
        if (index === -1) {
            result += text.substring(previousIndex)
            break;
        }
        result += text.substring(previousIndex, index)
        result += replacement
        previousIndex = index + needle.length;
    }
    return result;
}

const getSpecialZeroSuffix = (suffixes, index) => {
    return index === 0
        ? '_none'
        : `_some${suffixes[index - 1]}`;
}

const createPluralKey = ({type}, pluralName, suffixes, index) => {
    return pluralName +
        (type === 'pluralZero' ? getSpecialZeroSuffix(suffixes, index) : `${suffixes[index]}`);
}

const createPluralKeys = (token, pluralName, suffixes) => {
    const [variable, ...pluralForms] = token.value.split('|');
    return pluralForms.reduce((obj, pluralForm, index) => ({
        ...obj,
        [createPluralKey(token, pluralName, suffixes, index)]: replaceText(pluralForm, variable, `{{count}}`)
    }), {});
}

const createPluralTexts = ({tokens, plurals, outputName, suffixes, text}) => {
    const simplePluralCase = isSimplePlural(tokens);
    const pluralTokens = tokens
        .filter(({type}) => type.startsWith('plural'));
    if (simplePluralCase && plurals.length > 0) {
        const pluralVars = plurals.map((pluralType) => `'${pluralType}'`).join(', ');
        throw new Error(`Simple plural text like "${text}" does not need plurals configuration.\n`
            + `Found not needed 'plurals' configuration: {plurals: [${pluralVars}].\n`);
    }
    if (!simplePluralCase && pluralTokens.length !== plurals.length) {
        throw new Error('The number of plural variables should not differ in CMS key plural expressions.\n'
            + `${pluralTokens.length} plural expressions in "${text}".\n`
            + `${plurals.length} plural variables in configuration: plurals: [${plurals.join(', ')}].\n`);
    }
    const pluralSupplier = PluralSupplier(
        plurals,
        simplePluralCase ? outputName : 'undefined'
    );
    return pluralTokens
        .reduce((result, token) => {
            const pluralName = pluralSupplier.get();
            return {
                ...result,
                ...createPluralKeys(token, pluralName, suffixes)
            };
        }, {});
}

const Transform = ({
    lang,
    outputName,
    args,
    plurals = []
}) => (text) => {
    const tokens = parseCmsText(text, args);
    const suffixes = getSuffixes(lang);
    const config = {tokens, plurals, outputName, suffixes, text};
    return {
        ...createMainText(config),
        ...createPluralTexts(config)
    };
}

module.exports = Transform;
