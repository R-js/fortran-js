'use strict'

const { _, cc, isString } = require('./classes')

const classMatcher = (_class, pattern = 1) => {
	let start
	let endI
	let count

	// extended matching
	const isStr = typeof pattern === 'string'
	const isMin = isStr && pattern[0] === '<'
	const isMax = isStr && pattern[0] === '>'
	const max = isMax && parseInt(pattern.slice(1))
	const min = isMin && parseInt(pattern.slice(1))
	let state = 'in' // init, 'te' = tentative ,'m' = matched, 'em' = extended matching
	function setState(t, b, e, c) {
		const oc = count
		const ob = start
		const oe = endI
		const os = state
		start = b !== undefined ? b : start || 0
		endI = e !== undefined ? e : endI || 0
		state = t !== undefined ? t : state
		count = c !== undefined ? c : count || 0
		return { oc, ob, oe, os }
	}

	return function check(c, i) {
		// if not found 
		//    -> prev state 'em'? 
		//          -> emit matched value
		//          -> clear state
		//    -> prev state 'in'? 
		//          -> do nothing
		// if found
		//    -> prev state 'em'?
		//          -> consume char update internals
		//          -> emit 'em' state
		//    -> prev state 'in'?
		//          -> state tentative
		//          -> update state = 'te'
		//          (fall through to next)
		//    -> prev state 'te'?
		//          -> is full match?
		//            -> emit match
		//            -> clear state
		//          -> is not full match?
		//            -> emit partial match
		//          -> is extended match?
		//             -> state = "em"
		//             -> emit extended match 
		// partial history
		/*if (lookBack) {
        	start = i - 1
        	count = 1
        	endI = i
        	lookBack = false
        	if (max && count < max) {
        		state = 'te'
        	}
        	if (min && count < min) {
        		state = 'em'
        	}
        }
        */
		if (!_class(c)) {
			const { ob, oc, os, oe } = setState('in', i, i, 0)
			if (os === 'em') {
				return { s: 'm', b: ob, e: oe, count: oc }
			}
			return
		}
		if (max) { //> token
			if (count < max) {
				setState('te', state === 'in' ? i : _, i, _)
			}
		}
		switch (state) {
		case 'em':
			count++
			endI = i
			if (min && count >= min) {
				const { oc, ob, oe } = setState('in', i, i, 0)
				return { s: 'm', b: ob, e: oe, count: oc, }
			}
			return { s: 'em', count, b: start, e: endI }
		case 'in':
			setState('te', i, i, 0)
		case 'te':
			count++
			endI = i
			if (min) {
				if (count < min) {
					state = 'em'
					return { s: 'em', count, b: start, e: endI }
				}
				const { oc, ob, oe } = setState('in', i, i, 0)
				return { s: 'm', b: ob, e: oe, count: oc }
			}
			if (max) {
				if (count >= max) {
					const { oc, ob, oe } = setState('em', _, _, _)
					return { s: 'em', b: ob, e: oe, count: oc }
				}
				return { s: 'te', count }
			}
			if (count === pattern) {
				const { oc, ob, oe } = setState('in', i, i, 0)
				return { s: 'm', count: oc, b: ob, e: oe }
			}
		default:
			throw new Error('not a valid instruction set')
		}

	}
}

function literalMatcher(literal, noCase) {

	const isStr = typeof literal === 'string'
	const len = isStr && literal.length
	let start = 0
	let endI = 0
	let state = 'in'
	let idx = 0
	const upper = isStr && noCase && literal.toUpperCase()

	if (!isStr) { throw new Error(`literal [${literal}] not a string`) }
	if (len === 0) { throw new Error('literal is a string of length 0') }

	function setState(t, b, e, c) {
		const oi = idx
		const ob = start
		const oe = endI
		const os = state
		start = b !== undefined ? b : start || 0
		endI = e !== undefined ? e : endI || 0
		state = t !== undefined ? t : state
		idx = c !== undefined ? c : idx || 0
		return { oi, ob, oe, os }
	}

	return function check(c, i, arr) {
		arr
		const isMatch = c === literal[idx] || (c === upper[idx] && noCase)
		const isPrevCC = arr[i - 1] > cc && isString(arr[i - 1])
		const isNextCC = arr[i + 1] > cc && isString(arr[i + 1])
		// c doesnt match literal[count] ?
		//      count = 0
		//      start = i
		//      endI = i   
		//      state = 'in'
		//      return undefined
		// c matches literal[count]
		//    last char?
		//      return match, clean state
		//    not last char?
		//      return tentative
		if (['in', /* add more */ ].includes(state)) {
			if (isMatch && !isPrevCC) {
				setState('te', i, i, idx + 1)
				if (len === idx) {
					setState('em')
				}
				return { s: state, b: start, e: endI, count: idx }
			}
			//no match
			setState(_, i, i, 0)
			return
		}
		if (['te'].includes(state)) {
			if (!isMatch) {
				setState('in', i, i, 0)
				return
			}
			idx++
			endI = i
			if (len === idx) {
				if (isNextCC) {
					setState('in', i, i, 0)
					return
				}
				const rc = { s: 'm', b: start, e: endI, count: idx }
				setState('in', i, i, 0)
				return rc
			}
			setState(_, _, _, _)
			return { s: 'te', b: start, e: endI, count: idx }
		}
		throw new Error(`Invalid state [${state}]`)
	}
}

module.exports = {
	classMatcher,
	literalMatcher
}