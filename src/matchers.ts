'use strict'

export type TestFunc = (s: string) => RegExpMatchArray
export const regexp = (s: RegExp) => line => line.match(s)
export const isComment: TestFunc = (line) => {
	const found = line.match(/^([\*Cc][^\n]*)\n?/)
	if (found){
		const rc: RegExpMatchArray = [found[1]]
		rc.input = found[1]
		rc.index = 0
		return rc
	}
	return null
}


/*
type oldState = { oc: number, ob: number, oe: number, os: 'em' | 'm' | 'te' | 'in' }
export type IMatcherState = { s: 'em' | 'm' | 'te' | 'in', b: number, e: number, count: number }
export type IMatcher = (c: string, i: number) => IMatcherState


export const createClassMatcher = (_class, pattern: string | number = 1) => {
	let start
	let endI
	let count

	// extended matching
	const isStr = typeof pattern === 'string'
	const isMin = isStr && pattern[0] === '<'
	const isMax = isStr && pattern[0] === '>'
	const max = isMax && parseInt((<string>pattern).slice(1))
	const min = isMin && parseInt((<string>pattern).slice(1))
	let state: 'em' | 'm' | 'te' | 'in' = 'in' // init, 'te' = tentative ,'m' = matched, 'em' = extended matching
	function setState(t, b, e, c): oldState {
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

	return function check(c, i): IMatcherState {
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
					return { s: 'te', count } as any
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

export function createLiteralMatcher(literal, noCase) {

	const isStr = typeof literal === 'string'
	const len = isStr && literal.length
	let start = 0
	let endI = 0
	let state = 'in'
	let idx = 0
	const upper = isStr && noCase && literal.toUpperCase()

	if (!isStr) { throw new Error(`literal [${literal}] not a string`) }
	if (len === 0) { throw new Error('literal is a string of length 0') }

	function setState(t?, b?, e?, c?) {
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
		if (['in',].includes(state)) {
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
*/
