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
                'key %$2s with %$3s variables %$1s'
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
                'key %$2s with %$3s variables %$1s'
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
                '$pl[%$1s|item|items]'
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
                '$pl[%$1s|%$1s item|%$1s items]'
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
    })        
})