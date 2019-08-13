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
const lang = 'en';

describe('to i18next transform', () => {
    describe('testing transformations', () => {
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
            })
        })

        it('transform key with variables', () => {
            const content = contentWithKey(
                'key %2$s with %3$s variables %1$s'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['one', 'two', 'three'],
            })).to.be.deep.equal({
                new: {
                    path: 'key {{two}} with {{three}} variables {{one}}'
                }
            })
        })

        it('transform key with arguments', () => {
            const content = contentWithKey(
                'key %2$s with %3$s variables %1$s'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['one', 'two', 'three'],
            })).to.be.deep.equal({
                new: {
                    path: 'key {{two}} with {{three}} variables {{one}}'
                }
            })
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
            })
        })

        it('transform simple plural with argument', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|%1$s item|%1$s items)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['num'],
            })).to.be.deep.equal({
                new: {
                    path: '{{count}} item',
                    path_plural: '{{count}} items',
                }
            })
        })

        it('transform composite plurals without arguments', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|girl|girls)] and $[_pl(%2$s|boy|boys)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['numGirls', 'numBoys'],
                plurals: ['girl', 'boy'],
            })).to.be.deep.equal({
                new: {
                    path: '$t(girl, {\'count\': {{numGirls}}}) and $t(boy, {\'count\': {{numBoys}}})',
                    girl: 'girl',
                    girl_plural: 'girls',
                    boy: 'boy',
                    boy_plural: 'boys'
                }
            })
        })

        it('transform composite plurals with arguments', () => {
            const content = contentWithKey(
                'There are $[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['numOranges', 'numBananas'],
                plurals: ['orange', 'banana'],
            })).to.be.deep.equal({
                new: {
                    path: 'There are $t(orange, {\'count\': {{numOranges}}}) and $t(banana, {\'count\': {{numBananas}}})',
                    orange: '{{count}} orange',
                    orange_plural: '{{count}} oranges',
                    banana: '{{count}} banana',
                    banana_plural: '{{count}} bananas'
                }
            })
        })

        it('transform simple plural with argument distinct to {{count}}', () => {
            const content = contentWithKey(
                '$[_pl(%1$s|%1$s item with %2$s€ price|%1$s items with %2$s€ price)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                variables: ['num', 'price'],
            })).to.be.deep.equal({
                new: {
                    path: '{{count}} item with {{price}}€ price',
                    path_plural: '{{count}} items with {{price}}€ price',
                }
            })
        })

        it('transform composite plural with argument distinct to {{count}}', () => {
            const content = contentWithKey(
                'There are $[_pl(%2$s|%2$s orange with %1$s€ price|%2$s oranges with %1$s€ price)] and $[_pl(%3$s|%3$s banana with %4$s€ price|%3$s bananas with %4$s€ price)]'
            );
            const transform = Transform(content, lang);

            expect(transform({
                inputPath,
                outputPath,
                plurals: ['orange', 'banana'],
                variables: ['orangesPrice', 'numOranges', 'numBananas', 'bananasPrice'],
            })).to.be.deep.equal({
                new: {
                    path: 'There are $t(orange, {\'count\': {{numOranges}}, \'orangesPrice\': {{orangesPrice}}}) and $t(banana, {\'count\': {{numBananas}}, \'bananasPrice\': {{bananasPrice}}})',
                    orange: '{{count}} orange with {{orangesPrice}}€ price',
                    orange_plural: '{{count}} oranges with {{orangesPrice}}€ price',
                    banana: '{{count}} banana with {{bananasPrice}}€ price',
                    banana_plural: '{{count}} bananas with {{bananasPrice}}€ price',
                }
            })
        })
    })        
})