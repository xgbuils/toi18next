const R = require('ramda');
const escapeHtml = require('escape-html');
const ToI18nextKeys = require('./toI18nextKeys');

const FromPath = (cms) => (inputPath) => {
    if (!R.hasPath(inputPath, cms)) {
        const path = inputPath.map((e) => `"${e}"`).join(', ');
        throw new Error(`CMS does not have a key in path [${path}]`);
    }
    return R.path(inputPath, cms);
};

module.exports = (cms, transformMap, lang) => {
    const applyTransform = ({inputPath, outputPath, args, plurals}) => {
        const fromPath = FromPath(cms);
        const toI18nextKeys = ToI18nextKeys({
            lang,
            outputName: R.last(outputPath || []),
            args,
            plurals
        });
        const toPath = (keys) => (result) => {
            const path = R.init(outputPath);
            const object = R.merge(keys, R.path(path, result));
            return R.assocPath(path, object, result);
        };

        return R.pipe(
            fromPath,
            escapeHtml,
            toI18nextKeys,
            toPath,
        )(inputPath);
    };

    return transformMap.reduce((result, transform) => {
        return applyTransform(transform)(result);
    }, {});
};