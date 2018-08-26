
import {
    ISimpleToken,
    IRangeToken,
    isRangeToken,
    isSimpleToken,
    Snippet
} from './IToken'

import { regexp, TestFunc, isComment } from './matchers'
import { last } from './helpers'

export const chain = compose((a: Processed) => a.snippet)

export const processLineContinuation = createProcessor(regexp(/\n\s{5}[^\s]/))
export const processWS = createProcessor(regexp(/[\s\t]+/))
export const processComments = createProcessor(isComment)
export const processLf = createProcessor(regexp(/\n/))


export interface Processed {
    snippet: Snippet;
    token: IRangeToken;
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

export function* createSnippetsUsingTokens(raw: string, tokens: (ISimpleToken | IRangeToken)[]): IterableIterator<Snippet> {
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
        isSimpleToken(lastToken) && !isRangeToken(lastToken) //slicer token
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
            const gen = fn(data)
            let cnt = 0
            let done
            do {
                const it = gen.next()
                done = it.done
                if (!done) {
                    yield it.value
                    if (others.length > 0) {
                        yield* stream(convert(it.value), ...others)
                    }
                    cnt++
                }
                if (cnt === 0) {
                    if (others.length > 0) {
                        yield* stream(data, ...others)
                    }
                }
            } while (!done)
        }

        return function* activate(gen: IterableIterator<T>): IterableIterator<K> {
            for (const elt of gen) {
                yield* stream(elt, ...transformers)
            }
        }
    }
}