'use strict'

function letter(c) {
	return 'abcdefghijklmnopqrstuvwxyz'.indexOf(c) >= 0
}

function LETTER(c) {
	return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c) >= 0
}

function digits(c) {
	return '0123456789'.indexOf(c) >= 0
}

function alphaNum(c) {
	return letter(c) || LETTER(c) || digits(c)
}

function ws(c) {
	return '\t '.indexOf(c) >= 0
}

function lf(c) {
	return '\n' === c
}

function cr(c) {
	return '\r' === c
}

module.exports = {
	letter,
	LETTER,
	digits,
	alphaNum,
	ws,
	lf,
	cr
}