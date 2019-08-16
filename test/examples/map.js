module.exports = [{
	inputPath: ['foo', 'simple'],
	outputPath: ['path', 'to', 'simple', 'key'],
}, {
	inputPath: ['foo', 'withArgs'],
	outputPath: ['path', 'to', 'key', 'withArgs'],
	args: ['number1', 'number2']
}, {
	inputPath: ['bar', 'simplePlural'],
	outputPath: ['path', 'to', 'simple', 'plural', 'key'],
}, {
	inputPath: ['bar', 'complexPlural'],
	outputPath: ['path', 'to', 'complex', 'plural', 'key'],
	args: ['numOranges', 'numBananas'],
	plurals: ['orange', 'banana'],
}];
