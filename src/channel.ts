import * as debug from 'debug'

import {
    ISimpleToken,
    IRangeToken,
    sortTokenFAscTDesc,
    IToken,
    isRangeToken
} from './IToken';


import { last } from './helpers'
import {
    chain,
    Processed,
    createSnippetsUsingTokens
} from './processors'

const printer = debug('IChannel')

export interface IChannel<T extends ISimpleToken> {
    name: string;
    tokens: T[];
    process();
}
export interface ISpring<T> {
    slicers: T[],
    data: string
}

export function tokenAsSimple(res: Processed): ISimpleToken {
    return { f: res.token.f }
}

export function tokenAsRange(res: Processed): IRangeToken {
    return { f: res.token.f, t: res.token.t }
}

export function createChannel<T extends ISimpleToken, K extends ISimpleToken>(name: string, convert: (res: Processed) => T) {
    return function slicer(pipe: (Snippet) => IterableIterator<Processed>) {
        return function (spring?: () => ISpring<K>) {
            return function setModule(raw: string): IChannel<T> {

                const tokens: T[] = []
                const channel = {
                    tokens,
                    name,
                    process() {
                        tokens.splice(0)
                        if (raw.length === 0) {
                            printer(`channel [${name}] processed an empty file`)
                            return
                        }
                        const { data, slicers } = spring ? spring() : { data: raw, slicers: [{ f: raw.length }] }
                        for (const processed of pipe(createSnippetsUsingTokens(data, slicers))) {
                            //console.log(processed)
                            tokens.push(convert(processed))
                        }
                        tokens.sort(sortTokenFAscTDesc)
                    }
                }
                return channel
            }
        }
    }
}


export function createLogicalEOLChannel(ch: IChannel<ISimpleToken>, raw:string): IChannel<ISimpleToken> {

    let tokens: ISimpleToken[] = []
    const vCh: IChannel<ISimpleToken> = {
        tokens,
        name: 'vlf',
        process() {
            tokens.splice(0)
            const lftok = ch.tokens.slice(0)
            let prev = 0
            for (let i = 0; i < lftok.length; i++) {
                const pos = ch.tokens[i].f
                const line = raw.slice(prev, pos)
                prev = pos + 1
                if (line.match(/^\s{5}[^\s]/)) {
                    if (i === 0) {
                        const err = `first line cannot be continuation: [${line}]`
                        printer(err)
                        throw new Error(err)
                    }
                    // update in place
                    tokens[tokens.length - 1] = lftok[i]
                    continue
                }
                tokens.push({ f: lftok[i].f })
            }
        }
    }
    return vCh
}

export function createChannelExcluding(name: string, raw: string, ...ch: IChannel<any>[]): IChannel<IRangeToken> {

    if (ch.length === 0) {
        throw new Error(`Illegal Arguments, no arguments given`)
    }
    // merge and sort  all the tokens from the channels
    const tokens: IRangeToken[] = []
    const rc: IChannel<IRangeToken> = {
        tokens,
        name,
        process() {
            const excludeTokens = ch.map(c => c.tokens).reduce((col, arr) => {
                col.push(...arr)
                return col
            }, [])
            excludeTokens.sort(sortTokenFAscTDesc)
            tokens.splice(0)
            let prev = 0
            if (excludeTokens.length === 0) {
                tokens.push({ f: 0, t: raw.length - 1 })
                return
            }
            for (const token of excludeTokens) {
                if (token.f <= prev) { // we skipped ahead temp
                    prev = Math.max(token.f + 1, prev)
                    if ((<IRangeToken>token).t) {
                        prev = Math.max(prev, (<IRangeToken>token).t + 1)
                    }
                    continue
                }
                tokens.push({ f: prev, t: token.f - 1 })
                prev = isRangeToken(token) ?
                    (<IRangeToken>token).t + 1 :
                    token.f + 1
            }
            const lastToken = last(excludeTokens)
            if ((<IRangeToken>lastToken).t &&
                (<IRangeToken>lastToken).t < raw.length - 1) {
                tokens.push({ f: (<IRangeToken>lastToken).t + 1, t: raw.length - 1 })
            }
            else if (lastToken.f < raw.length - 1) {
                tokens.push({ f: lastToken.f + 1, t: raw.length - 1 })
            }
        }
    }
    return rc
}

