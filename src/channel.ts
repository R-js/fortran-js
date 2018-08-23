import * as debug from 'debug'

import { ISimpleToken, IRangeToken } from './IToken';
import { IModule, IModuleEnums } from './module'
import { IMatcher, IMatcherState, createClassMatcher } from './matchers'
import { ITokenEmitter } from './tokenProducers'
import { isComment, isContinue, binarySearch, last } from './helpers'
import { ws } from './classes'
import { createTokenEmitter, rangeProducer } from './tokenProducers'

const printer = debug('IChannel')

export interface linePos {
    ln: number;
    col: number;
}
export interface Snippet {
    line: string;
    f: number;
    t: number;
}

export interface Processed {
    snippets: Snippet[];
    tokens: IRangeToken[];
}

function compare(a: any, b: any): 0 | -1 | 1 {
    const df = a.f - b.f
    if (df > 0) return 1
    if (df < 0) return -1
    if (a.t !== undefined && b.t !== undefined) {
        const dt = a.t - b.t
        if (dt > 0) return 1
        if (dt < 0) return -1
    }
    return 0
}

const search = binarySearch(compare)
const wsMatcher = createClassMatcher(ws, '>1')
const wsEmitter = createTokenEmitter(rangeProducer, wsMatcher)


export interface IChannel<T extends ISimpleToken> {
    mod: IModule;
    name: string;
    tokens: T[];
    process();
}

export function createChannel<T extends ISimpleToken>(name: string) {
    return function addTokenMatchers(...te: (ITokenEmitter<T>)[]) {
        if (te.length === 0) {
            throw new Error(`No token emitter functions specified`)
        }
        return function setModule(module: IModule): IChannel<T> {
            //module,
            const channel = {
                mod: module,
                tokens: [],
                name,
                process() {
                    if (!module.state.has(IModuleEnums.loaded)) {
                        throw new Error(`Module [${module.name}] not loaded`)
                    }
                    const raw = module.raw
                    if (module.raw.length === 0) {
                        printer(`module [${module.name}] loaded an empty file`)
                        return
                    }
                    this.tokens = [] //clear
                    for (let i = 0; i < raw.length; i++) {
                        te.forEach(fn => {
                            const token = fn(raw[i], i)
                            if (token) {
                                this.tokens.push(token)
                            }
                        })
                    }
                }
            }
            module.channels.set(name, channel)
            return channel
        }
    }
}

export function createLogicalEOLChannel<T extends ISimpleToken>(ch: IChannel<T>): IChannel<T> {

    if (ch !== ch.mod.channels.get('lf')) {
        throw new TypeError(`source "lf" channel is not registered with a module`)
    }
    let tokens: T[] = []
    const vCh: IChannel<T> = {
        mod: ch.mod,
        tokens,
        name: 'vlf',
        process() {
            tokens = []
            const lftok = ch.tokens.slice(0)
            const raw = ch.mod.raw
            let prev = 0
            for (let i = 0; i < lftok.length; i++) {
                const pos = ch.tokens[i].f
                const line = raw.slice(prev, pos)
                prev = pos + 1
                if (isContinue(line)) {
                    if (i === 0) {
                        const err = `first line cannot be continuation: [${line}]`
                        printer(err)
                        throw new Error(err)
                    }
                    // update in place
                    tokens[tokens.length - 1] = lftok[i]
                    continue
                }
                tokens.push(lftok[i])
            }
        }
    }
    ch.mod.channels.set(vCh.name, vCh)
    return vCh
}

export function createCommentsChannel(ch: IChannel<ISimpleToken>): IChannel<IRangeToken> {

    const vlf = ch.mod.channels.get('vlf')
    const lf = ch.mod.channels.get('lf')

    if (ch !== vlf && ch !== lf) {
        throw new TypeError(`source "lf/vlf" channel is not registered with a module`)
    }
    const _lf = vlf || lf
    const tokens: IRangeToken[] = []
    const raw = _lf.mod.raw
    const comm: IChannel<IRangeToken> = {
        mod: ch.mod,
        tokens,
        name: 'comments',
        process() {
            tokens.splice(0)
            const lftok = _lf.tokens.slice(0) //copy
            let prev = 0
            for (let i = 0; i < lftok.length; i++) {
                const pos = lftok[i].f
                const line = raw.slice(prev, pos)
                if (isComment(line)) {
                    tokens.push({ f: prev, t: pos - 1 })
                }
                prev = pos + 1
            }
            const lastf = last(lftok).f
            if (lastf < raw.length - 1) {
                const line = raw.slice(lastf + 1)
                if (isComment(line)) {
                    tokens.push({ f: lastf + 1, t: raw.length - 1 })
                }
            }
        }
    }
    ch.mod.channels.set(comm.name, comm)
    return comm
}

export function createSourceChannel(ch: IChannel<ISimpleToken>): IChannel<IRangeToken> {

    const vlf = ch.mod.channels.get('vlf')
    const comms = ch.mod.channels.get('comments') as IChannel<IRangeToken>
    if (vlf !== ch) {
        throw new TypeError(`source "vlf" channel is not registered with a module`)
    }
    if (comms === undefined) {
        throw new TypeError(`source "comments" channel is not registered with a module`)
    }
    const tokens: IRangeToken[] = []

    const source: IChannel<IRangeToken> = {
        mod: ch.mod,
        tokens, //vtokens
        name: 'source',
        process() {
            tokens.splice(0) // delete in palce
            const lftok = vlf.tokens.slice(0) //copy
            const raw = vlf.mod.raw
            let prev = 0
            const lastf = last(lftok).f
            for (let i = 0; i < lftok.length; i++) {
                const pos = lftok[i].f
                const line = raw.slice(prev, pos)
                if (!isComment(line)) {
                    tokens.push({ f: prev, t: pos - 1 })
                }
                prev = pos + 1
            }
            if (lastf < raw.length - 1) {
                const line = raw.slice(lastf + 1)
                if (!isComment(line)) {
                    tokens.push({ f: lastf + 1, t: raw.length - 1 })
                }
            }
        }
    }
    ch.mod.channels.set(source.name, source)
    return source
}

export function createWSChannel(ch: IChannel<IRangeToken>): IChannel<IRangeToken> {

    const vlf = ch.mod.channels.get('vlf') as IChannel<ISimpleToken>
    const source = ch.mod.channels.get('source') as IChannel<IRangeToken>
    if (vlf !== ch) {
        throw new TypeError(`source "vlf" channel is not registered with a module`)
    }
    if (source === undefined) {
        throw new TypeError(`source "comments" channel is not registered with a module`)
    }
    const raw = vlf.mod.raw
    const tokens: IRangeToken[] = []
    const nonWSSource: Snippet[] = []
    const ws: IChannel<IRangeToken> = {
        mod: ch.mod,
        tokens: [], //vtokens
        name: 'ws',
        process() {
            tokens.splice(0)
            nonWSSource.splice(0)
            const srctok = source.tokens.slice(0) //copy
            for (let i = 0; i < srctok.length; i++) {
                const { f, t } = srctok[i]
                let snip = { line: raw.slice(f, t + 1), f, t }
                // split out continueation lines
                const { snippets, tokens: _tokens } = processLineContinuation(snip)
                tokens.splice(0, 0, ..._tokens)
                snippets.map(processWS).forEach(({ snippets: snips, tokens: toks }) => {
                    tokens.splice(0, 0, ...toks)
                    nonWSSource.splice(0, 0, ...snips)
                })
                // here the ws token need to be extracted from line
            }
            //sort ws tokens because there will be continue line stuff here!!
        }
    }
    ch.mod.channels.set(source.name, source)
    return source
}

export function createProcessor(regex: RegExp) {

    return function process(s: Snippet): Processed {
        const { line, f, t } = s
        const found = line.match(regex);
        const rc = {
            snippets: [s],
            tokens: []
        }

        if (found) {
            const first = line.slice(0, found.index)
            const second = line.slice(found.index + found[0].length)
            rc.snippets[0] = { line: first, f, t: f + first.length - 1 }
            rc.tokens[0] = { f: f + found.index, t: f + found.index + found[0].length - 1 }
            if (second) {
                const rv = process({ line: second, f: f + found.index + found[0].length, t })
                rc.tokens.splice(0, 0, ...rv.tokens)
                rc.snippets.splice(0, 0, ...rv.snippets)
            }
        }
        return rc
    }
}

export const processLineContinuation = createProcessor(/\n\s{5}[^\s]/)
export const processWS = createProcessor(/[\s\t]+/)

