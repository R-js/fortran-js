'use strict'

export type TestFunc = (s:string) => RegExpMatchArray

export function letter(c) {
	return 'abcdefghijklmnopqrstuvwxyz'.includes(c) 
}

export function LETTER(c) {
	return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(c)
}

export function digits(c) {
	return '0123456789'.includes(c)
}

export function alphaNum(c) {
	return letter(c) || LETTER(c) || digits(c)
}

export function ws(c) {
	return '\t '.includes(c)
}

export function lf(c) {
	return '\n' === c
}

export function cr(c) {
	return '\r' === c
}

export function operators(c) {
	return '()*,=-+/'.includes(c) //
}
