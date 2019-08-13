const R = require('ramda');
const i18next = require('i18next');
i18next.init();

const lng = 'en';

const getSuffixes = (lang) => {
    const rule = i18next.services.pluralResolver.getRule(lang);
    return rule.numbers.length === 2
        ? ['', '_plural']
        : Object.keys(rule.numbers).map(index => `_${index}`);
}

const i18nextVarRegExp = /^\{\{(.+?)\}\}$/;
const pluralRegExp = /\$\[_pl\((.+?)\)\]/g

const TokensBuilder = (variables) => {
    const tokens = [];
    return {
        pushText(value) {
            if (value) {
                tokens.push({
                    ...replaceVariables(variables, value),
                    type: 'text',
                })
            }
        },
        pushPlural(value) {
            tokens.push({
                ...replaceVariables(variables, value),
                type: 'plural',
            })
        },
        build() {
            return tokens;
        }
    }
}

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

const replaceVariables = (variables, text) => {
    const vars = new Set();
    const replacedText = text.replace(/%(\d+)\$s/g, (match, num) => {
        const variable = variables[parseInt(num) - 1];
        vars.add(variable);
        return `{{${variable}}}`;
    });
    return {
        value: replacedText,
        vars,
    };
}

const getTokens = (cmsValue, variables = []) => {
    const tokensBuilder = TokensBuilder(variables);
    let previousIndex = 0;
    while(true) {
        const result = pluralRegExp.exec(cmsValue);
        if (!result) {
            tokensBuilder.pushText(cmsValue.substring(previousIndex))
            break;
        }
        const [match, pluralForms] = result;
        tokensBuilder.pushText(cmsValue.substring(previousIndex, result.index))
        tokensBuilder.pushPlural(pluralForms)
        previousIndex = result.index + match.length;
    }
    return tokensBuilder.build();
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
                ? `'count': {{${variable}}}`
                : `'${variable}': {{${variable}}}`;
        })
        .join(', ');
    return `$t(${pluralName}, {${variablesObject}})`;
}

const isSimplePlural = (tokens) => {
    return tokens.length === 1 && tokens[0].type === 'plural';
}

const createMainText = (tokens, plurals, outputName) => {
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

const createPluralTexts = (tokens, plurals, lang, outputName) => {
    const suffixes = getSuffixes(lang);
    const pluralTokens = tokens
        .filter(({type}) => type === 'plural');
    const pluralSupplier = PluralSupplier(
        plurals,
        isSimplePlural(tokens) ? outputName : 'undefined'
    );
    return pluralTokens
        .reduce((result, {value}) => {
            const [variable, ...pluralForms] = value.split('|');
            const pluralName = pluralSupplier.get();
            const text = pluralForms.reduce((obj, pluralForm, index) => ({
                ...obj,
                [`${pluralName}${suffixes[index]}`]: replaceText(pluralForm, variable, `{{count}}`)
            }), {})
            return {
                ...result,
                ...text
            };
        }, {});
}

const Transform = (cms, lang) => ({
    inputPath,
    outputPath,
    variables,
    plurals
}) => {
    const cmsValue = R.path(inputPath, cms);
    const tokens = getTokens(cmsValue, variables);
    const outputName = outputPath.slice(-1)[0]
    const path = outputPath.slice(0, -1)
    const obj = R.merge(
        createMainText(tokens, plurals, outputName),
        createPluralTexts(tokens, plurals, lang, outputName)
    )
    return R.assocPath(path, obj, {})
}

module.exports = Transform;
