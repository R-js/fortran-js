import * as debug from 'debug'

import { ISimpleToken, IRangeToken, sortTokenFAscTDesc, IToken, isRangeToken, isSimpleToken } from './IToken';
import { IModule, IModuleEnums } from './module'
import { IMatcher, IMatcherState, createClassMatcher } from './matchers'
import { ITokenEmitter } from './tokenProducers'
import { isContinue, binarySearch, last, propsExist } from './helpers'
import { ws, TestFunc } from './classes'
import { createTokenEmitter, rangeProducer } from './tokenProducers'
import { Stream } from 'stream';

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
    snippet: Snippet;
    token: IRangeToken;
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


const regexp = (s: RegExp) => line => line.match(s)
const isComment = line => {

    if ('*Cc'.includes(line[0])) {
        const found: RegExpMatchArray = [line]
        found.index = 0
        found.input = line
        return found
    }
    return null
}

const isNotComment = line => {
    if (!isComment(line)) {
        const found: RegExpMatchArray = [line]
        found.index = 0
        found.input = line
        return found
    }
    return null
}

const chain = compose((a: Processed) => a.snippet)

export const processLineContinuation = createProcessor(regexp(/\n\s{5}[^\s]/))
export const processNonComments = createProcessor(isNotComment)
export const processWS = createProcessor(regexp(/[\s\t]+/))
export const processComments = createProcessor(isComment)



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
            tokens.splice(0)
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

    const pipeLine = chain(processComments)

    const comm: IChannel<IRangeToken> = {
        mod: ch.mod,
        tokens,
        name: 'comments',
        process() {
            tokens.splice(0)
            const lftok = _lf.tokens.slice(0) //copy
            for (const processed of pipeLine(createSnippetsUsingTokens(raw, lftok))) {
                tokens.push(processed.token)
            }
        }
    }
    ch.mod.channels.set(comm.name, comm)
    return comm
}

export function createChannelExcluding(name: string, ...ch: IChannel<IToken>[]): IChannel<IRangeToken> {

    if (ch.length === 0) {
        throw new Error(`Illegal Arguments, no arguments given`)
    }
    const foundErrMod = ch.find(fch => fch.mod !== ch[0].mod)
    if (foundErrMod) {
        throw new Error(`Channels dont come from the same module`)
    }
    // merge and sort  all the tokens from the channels
    const tokens: IRangeToken[] = []
    const raw = ch[0].mod.raw
    const rc: IChannel<IRangeToken> = {
        mod: ch[0].mod,
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
    ch[0].mod.channels.set(name, rc)
    return rc
}

export function createWSChannel(ch: IChannel<IRangeToken>): IChannel<IRangeToken> {

    const source = ch.mod.channels.get('source') as IChannel<IRangeToken>
    if (source === undefined) {
        throw new TypeError(`source "comments" channel is not registered with a module`)
    }
    const raw = ch.mod.raw
    const pipeLine = chain(processLineContinuation, processWS)
    const tokens: IRangeToken[] = []
    const ws: IChannel<IRangeToken> = {
        mod: ch.mod,
        tokens, //vtokens
        name: 'ws',
        process() {
            tokens.splice(0)
            const tok = source.tokens.slice(0) //copy
            for (const processed of pipeLine(createSnippetsUsingTokens(raw, tok))) {
                tokens.push(processed.token)
            }
            tokens.sort((t1, t2) => t1.f - t2.f)
        }
    }
    ch.mod.channels.set(ws.name, ws)
    return ws
}

export function createProcessor(matcher: TestFunc) {

    return function* processor(s: Snippet): IterableIterator<Processed> {
        const { line, f, t } = s
        const found = matcher(line)
        if (found) {
            const first = line.slice(0, found.index)
            const second = line.slice(found.index + found[0].length)
            yield {
                snippet: { line: first, f, t: f + first.length - 1 },
                token: { f: f + found.index, t: f + found.index + found[0].length - 1 }
            }
            if (second) {
                yield* processor({ line: second, f: f + found.index + found[0].length, t })
            }
        }
    }
}

function* createSnippetsUsingTokens(raw: string, tokens: (ISimpleToken | IRangeToken)[]): IterableIterator<Snippet> {
    if (!(raw || '').trim()) {
        return
    }
    let prev = 0

    for (const token of tokens) {
        if (isRangeToken(token)) {// range token
            const { f, t } = <IRangeToken>token
            yield { line: raw.slice(f, t + 1), f, t }
            prev = t + 1
        }
        else if (isSimpleToken(token)) {//simpletoken
            const { f } = <ISimpleToken>token
            yield { line: raw.slice(prev, f), f: prev, t: f - 1 }
            prev = f + 1

        }
        else {
            throw new Error(`token is not a SimpleToken or a RangeToken, i.e: [${JSON.stringify(token)}]`)
        }
    }
    const lastToken = last(tokens)
    if (
        isSimpleToken(lastToken) //slicer token
        || lastToken === undefined //source code has only one-liner?
    ) {
        const f = lastToken && lastToken.f || 0
        if (raw.length - 1 > f) {
            yield { line: raw.slice(f + 1, raw.length), f: f + 1, t: raw.length - 1 }
        }
    }
}


export function compose<T, K>(convert: (a: K) => T) {

    return function chain(...transformers: ((s: T) => IterableIterator<K>)[]) {

        function* stream(data: T, ...fns: ((s: T) => IterableIterator<K>)[]) {
            const [fn, ...others] = fns
            for (const elt of fn(data)) {
                yield elt
                if (others.length) {
                    yield* stream(convert(elt), ...others)
                }
            }
        }

        return function* activate(gen: IterableIterator<T>): IterableIterator<K> {
            for (const elt of gen) {
                yield* stream(elt, ...transformers)
            }
        }
    }
}