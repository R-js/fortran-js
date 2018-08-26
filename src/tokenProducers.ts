/*'use strict'

import { IMatcherState, IMatcher } from './matchers'
import { ISimpleToken, IRangeToken } from './IToken';

export type IProducer<T extends ISimpleToken> = (m: IMatcherState) => T
export type ITokenEmitter<T extends ISimpleToken> = (c: string, i: number) => (T | undefined)

function createProducer<T extends ISimpleToken>(check: IProducer<T>): IProducer<T> {

    return function (am: IMatcherState) {
        const rc = check(am)
        if (rc) {
            return rc
        }
        throw new TypeError(`token is not matched ${JSON.stringify(am)}`)
    }
}

export const simpleProducer = createProducer(
    m => {
    if (m.s === 'm') {
        return {
            f: m.b
        }
    }
})

export const rangeProducer = createProducer(m=>{
    if (m.s === 'm') {
        return {
            f: m.b,
            t: m.e
        } as IRangeToken
    }
})

export function createTokenEmitter<T extends ISimpleToken>
(tp: IProducer<T>, matcher: IMatcher): (c:string, i:number) => T| undefined {
    return function emitToken(c: string, i: number): T | undefined {
        const ms = matcher(c, i)
        if (ms && ms.s === 'm') {
            return tp(ms)
        }
    }
}
*/