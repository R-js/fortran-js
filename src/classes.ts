'use strict'

export function letter(c) {
	return 'abcdefghijklmnopqrstuvwxyz'.includes(c) 
}

export function LETTER(c) {
	return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c)
}

export function digits(c) {
	return '0123456789'.indexOf(c) >= 0
}

export function alphaNum(c) {
	return letter(c) || LETTER(c) || digits(c)
}

export function ws(c) {
	return '\t '.indexOf(c) >= 0
}

export function lf(c) {
	return '\n' === c
}

export function cr(c) {
	return '\r' === c
}

export function operators(c) {
	return '<>)(*+-/.^'.includes(c) //
}
