module.exports = {
    foo: {
        simple: 'simple value',
        withArgs: 'there are %1$s or %2$s args'
    },
    bar: {
        simplePlural: '$[_pl(%1$s|%1$s item|%1$s items)]',
        complexPlural: '$[_pl(%1$s|%1$s orange|%1$s oranges)] and $[_pl(%2$s|%2$s banana|%2$s bananas)]',
        anotherKey: 'fizz buzz'
    },
    other: {
        keys: 'hi!'
    },
    html: {
        key1: 'key <span>%2$s</span> with <div>%3$s</div> variables <script type="text/javascript">%1$s</script>',
        key2: '$[_pl(%1$s|<b>%1$s</b> item|<i>%1$s</i> items|%1$s <b>itemzz</b>)]',
    },
}