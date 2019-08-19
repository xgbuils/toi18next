const {expect} = require('chai');

const cms = require('./examples/cms');
const map = require('./examples/map');
const nonExistentKeyMap = require('./examples/nonExistentKeyMap');
const wrongArgsMap = require('./examples/wrongArgsMap');
const transform = require('../src/transform');

const lang = 'en';

describe('Transform', () => {
    it('happy path', () => {
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
    });

    it('map with non-existent key', () => {
        const test = () => transform(cms, nonExistentKeyMap, lang);
        expect(test).to.throw('CMS does not have a key in path ["special", "key"]');
    });

    it('map with wrong args in transformation object', () => {
        const test = () => transform(cms, wrongArgsMap, lang);
        expect(test).to.throw(
            'CMS text "there are %1$s or %2$s args" does not have the same number of arguments as configuration:\n' +
            '2 CMS text arguments: %1$s, %2$s.\n' +
            '1 configuration arguments: {args: [\'number1\']}.\n'
        );
    });
});