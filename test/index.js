const {expect} = require('chai');

const cms = require('./examples/cms');
const map = require('./examples/map');
const transform = require('../src/transform');

const lang = 'en';

describe('Transform', () => {
    it('try example', () => {
        expect(transform(cms, map, lang)).to.be.deep.equal({
            path: {
                to: {
                    simple: {
                        key: 'simple value',
                        plural: {
                          key: '{{count}} item',
                          key_plural: '{{count}} items'
                        }
                    },
                    key: {
                        withArgs: 'there are {{number1}} or {{number2}} args'
                    },
                    complex: {
                        plural: {
                            key: '$t(orange, {count: {{numOranges}}}) and $t(banana, {count: {{numBananas}}})',
                            orange: '{{count}} orange',
                            orange_plural: '{{count}} oranges',
                            banana: '{{count}} banana',
                            banana_plural: '{{count}} bananas',
                        }
                    }
                }             
            }
        })
    })
});