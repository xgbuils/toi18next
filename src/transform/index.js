const R = require('ramda');
const ToI18nextKeys = require('./toI18nextKeys');

const FromPath = (cms) => (transform) => {
    if (!R.hasPath(transform.inputPath, cms)) {
        const inputPath = transform.inputPath.map((e) => `"${e}"`).join(', ');
        throw new Error(`CMS does not have a key in path [${inputPath}]`);
    }
    return {
        ...transform,
        text: R.path(transform.inputPath, cms),
    }
};

const toPath = ({outputPath, keys}) => R.assocPath(outputPath, keys);

module.exports = (cms, transformMap, lang) => {
    const fromPath = FromPath(cms);
    const toI18nextKeys = ToI18nextKeys(lang);

    const applyTransform = R.pipe(
        fromPath,
        (transform) => ({
            outputPath: R.init(transform.outputPath),
            keys: toI18nextKeys({
                ...transform,
                outputName: R.last(transform.outputPath || [])
            })
        }),
        toPath
    );
    return transformMap.reduce((result, transform) => {
        return applyTransform({
            ...transform,
            outputPath: transform.outputPath || []
        })(result);
    }, {});
};