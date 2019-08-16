const {expect} = require('chai');

const Transform = require('../src/index');
const contentWithKey = (key) => ({
    path: {
        to: {
            key,
        }
    }
})
const inputPath = ['path', 'to', 'key'];
const outputPath = ['new', 'path'];

describe('to i18next transform', () => {
    describe('testing transformations', () => {
        const lang = 'en';
        it('transform simple key', () => {
            const content = contentWithKey('simple value');
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
            })).to.be.deep.equal({
                new: {
                    path: 'simple value'
                }
            });
        })

        it('transform key with variables', () => {
            const content = contentWithKey(
                'key %2$s with %3$s variables %1$s'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['one', 'two', 'three'],
            })).to.be.deep.equal({
                new: {
                    path: 'key {{two}} with {{three}} variables {{one}}'
                }
            });
        })

        it('transform key with arguments', () => {
            const content = contentWithKey(
                'key %2$s with %3$s variables %1$s'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['one', 'two', 'three'],
            })).to.be.deep.equal({
                new: {
                    path: 'key {{two}} with {{three}} variables {{one}}'
                }
            });
        })

        it('transform simple plural without argument', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|item|items)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
            })).to.be.deep.equal({
                new: {
                    path: 'item',
                    path_plural: 'items',
                }
            });
        })

        it('transform simple plural with argument', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|%1$s item|%1$s items)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['num'],
            })).to.be.deep.equal({
                new: {
                    path: '{{count}} item',
                    path_plural: '{{count}} items',
                }
            });
        });

        it('transform simple plural with zero special case', () => {
            const content = contentWithKey(
                '$[_pl0(%1$s|No items|%1$s item|%1$s items)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
            })).to.be.deep.equal({
                new: {
                    path_none: 'No items',
                    path_some: '{{count}} item',
                    path_some_plural: '{{count}} items',
                }
            });
        });

        it('transform composite plurals without arguments', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|girl|girls)] and $[_pl(%2$s|boy|boys)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['numGirls', 'numBoys'],
                plurals: ['girl', 'boy'],
            })).to.be.deep.equal({
                new: {
                    path: '$t(girl, {count: {{numGirls}}}) and $t(boy, {count: {{numBoys}}})',
                    girl: 'girl',
                    girl_plural: 'girls',
                    boy: 'boy',
                    boy_plural: 'boys'
                }
            });
        });

        it('transform composite plurals with arguments', () => {
            const content = contentWithKey(
                'There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['numOranges', 'numBananas'],
                plurals: ['orange', 'banana'],
            })).to.be.deep.equal({
                new: {
                    path: 'There are $t(orange, {count: {{numOranges}}}) and $t(banana, {count: {{numBananas}}})',
                    orange: '{{count}} orange',
                    orange_plural: '{{count}} oranges',
                    banana: '{{count}} banana',
                    banana_plural: '{{count}} bananas',
                },
            });
        });

        it('transform composite plurals with zero special case', () => {
            const content = contentWithKey(
                'There are $[_pl0(%1$s|No oranges|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['numOranges', 'numBananas'],
                plurals: ['orange', 'banana'],
            })).to.be.deep.equal({
                new: {
                    path: 'There are $t(orange, {count: {{numOranges}}}) and $t(banana, {count: {{numBananas}}})',
                    orange_none: 'No oranges',
                    orange_some: '{{count}} orange',
                    orange_some_plural: '{{count}} oranges',
                    banana: '{{count}} banana',
                    banana_plural: '{{count}} bananas',
                },
            });
        });

        it('transform simple plural with argument distinct to {{count}}', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|%1$s item with %2$s€ price|%1$s items with %2$s€ price)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                args: ['num', 'price'],
            })).to.be.deep.equal({
                new: {
                    path: '{{count}} item with {{price}}€ price',
                    path_plural: '{{count}} items with {{price}}€ price',
                }
            });
        });

        it('transform composite plural with argument distinct to {{count}}', () => {
            const content = contentWithKey(
                'There are $[_pl(%2$s|%2$s orange with %1$s€ price|%2$s oranges with %1$s€ price)] and $[_pl(%3$s|%3$s banana with %4$s€ price|%3$s bananas with %4$s€ price)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                plurals: ['orange', 'banana'],
                args: ['orangesPrice', 'numOranges', 'numBananas', 'bananasPrice'],
            })).to.be.deep.equal({
                new: {
                    path: 'There are $t(orange, {count: {{numOranges}}, orangesPrice: {{orangesPrice}}}) and $t(banana, {count: {{numBananas}}, bananasPrice: {{bananasPrice}}})',
                    orange: '{{count}} orange with {{orangesPrice}}€ price',
                    orange_plural: '{{count}} oranges with {{orangesPrice}}€ price',
                    banana: '{{count}} banana with {{bananasPrice}}€ price',
                    banana_plural: '{{count}} bananas with {{bananasPrice}}€ price',
                }
            });
        });
    });

    describe('wrong transformation configs', () => {
        const lang = 'en';
        describe('number of configuration plurals differs in number of plural expressions', () => {
            it('simple plural key', () => {
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s banana|%1$s bananas)]'
                );
                const transform = Transform(content, lang);

                const test = () => transform({
                    inputPath,
                    outputPath,
                    args: ['numBananas'],
                    plurals: ['orange', 'banana', 'apple'],
                });

                expect(test).to.throw(
                    'Simple plural text like "$[_pl(%1$s|%1$s banana|%1$s bananas)]" does not need plurals configuration.\n'
                    + 'Found not needed \'plurals\' configuration: {plurals: [\'orange\', \'banana\', \'apple\'].\n'
                );
            });

            it('composite plural key', () => {
                const content = contentWithKey(
                    'There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]'
                );
                const transform = Transform(content, lang);

                const test = () => transform({
                    inputPath,
                    outputPath,
                    args: ['numOranges', 'numBananas'],
                    plurals: ['orange', 'banana', 'apple'],
                });

                expect(test).to.throw(
                    'The number of plural variables should not differ in CMS key plural expressions.\n'
                    + '2 plural expressions in "There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]".\n'
                    + '3 plural variables in configuration: plurals: [orange, banana, apple].\n'
                );
            });
        })

        describe('number of configuration arguments differs in number of CMS key arguments', () => {
            it('simple plural key', () => {
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s orange|%1$s oranges)]'
                );
                const transform = Transform(content, lang);

                const test = () => transform({
                    inputPath,
                    outputPath,
                    args: ['numOranges', 'numBananas'],
                });

                expect(test).to.throw(
                    'CMS text "$[_pl(%1$s|%1$s orange|%1$s oranges)]" does not have the same number of arguments as configuration:\n'
                    + '1 CMS text arguments: %1$s.\n'
                    + '2 configuration arguments: {args: [\'numOranges\', \'numBananas\']}.\n'
                );
            });

            it('composite plural key', () => {
                const content = contentWithKey(
                    'There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]'
                );
                const transform = Transform(content, lang);

                const test = () => transform({
                    inputPath,
                    outputPath,
                    args: ['numOranges'],
                    plurals: ['orange', 'banana'],
                });

                expect(test).to.throw(
                    'CMS text "There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]" does not have the same number of arguments as configuration:\n'
                    + '2 CMS text arguments: %1$s, %2$s.\n'
                    + '1 configuration arguments: {args: [\'numOranges\']}.\n'
                );
            });
        });
    });

    describe('testing plurals with other languages', () => {
        describe('Japanese plurals (no plural)', () => {
            it('ja', () => {
                const lang = 'ja'
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s item)]'
                );
                const transform = Transform(content, lang);

                expect(transform({
                    inputPath,
                    outputPath,
                    args: ['num'],
                })).to.be.deep.equal({
                    new: {
                        path_0: '{{count}} item',
                    }
                });
            });

            it('ja-JP', () => {
                const lang = 'ja-JP'
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s item)]'
                );
                const transform = Transform(content, lang);

                expect(transform({
                    inputPath,
                    outputPath,
                    args: ['num'],
                })).to.be.deep.equal({
                    new: {
                        path_0: '{{count}} item',
                    }
                });
            });
        })

        describe('Polish plurals (two plurals)', () => {
            it('pl', () => {
                const lang = 'pl';
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s item)]'
                );
                const transform = Transform(content, lang);

                expect(transform({
                    inputPath,
                    outputPath,
                    args: ['num'],
                })).to.be.deep.equal({
                    new: {
                        path_0: '{{count}} item',
                    }
                });
            });

            it('pl-PL', () => {
                const lang = 'pl-PL';
                const content = contentWithKey(
                    '$[_pl(%1$s|%1$s item|%1$s items|%1$s itemzz)]'
                );
                const transform = Transform(content, lang);

                expect(transform({
                    inputPath,
                    outputPath,
                    args: ['num'],
                })).to.be.deep.equal({
                    new: {
                        path_0: '{{count}} item',
                        path_1: '{{count}} items',
                        path_2: '{{count}} itemzz',
                    }
                });
            });
        });
    });

    describe('CMS text validation', () => {
        const lang = 'es';
        it('detects missed arguments in CMS text', () => {
            const content = contentWithKey(
                'key %3$s with %5$s variables %1$s'
            );
            const transform = Transform(content, lang);

            const test = () => transform({
                inputPath,
                outputPath,
                args: ['one', 'two', 'three', 'four', 'five'],
            });

            expect(test).to.throws(
                'CMS text "key %3$s with %5$s variables %1$s" is missing some intermediate arguments:\n'
                + 'current arguments: %1$s, %3$s, %5$s\n'
                + 'missing arguments: %2$s, %4$s\n'
            );
        });
    });
})