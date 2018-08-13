const { /*alphaNum, match,*/ literalMatcher } = require('./src/matchers')

//const a6 = match(alphaNum)('>6')

const isFOR = literalMatcher('FOR', true)

const rc = 'FORR FOR'.split('').map((c, i, arr) => {
	const v = isFOR(c, i, arr)
	if (v && v.s === 'm') {
		console.log(v, arr.slice(v.b, v.e + 1).join(''))
	}
	return v
})

console.log(rc)