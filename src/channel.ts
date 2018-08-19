import * as debug from 'debug'

import { ISimpleToken, IRangeToken } from './IToken';
import { IModule, IModuleEnums } from './module'
import { IMatcher, IMatcherState } from './matchers'
import { ITokenEmitter } from './tokenProducers'
import { isComment, isContinue } from './helpers'

const printer = debug('IChannel')

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
    const vCh: IChannel<T> = {
        mod: ch.mod,
        tokens: [], //vtokens
        name: 'vlf',
        process() {
            const tokens = this.tokens = []
            let prev = 0
            for (let i = 0; i < ch.tokens.length; i++) {
                const pos = ch.tokens[i].f
                const line = ch.mod.raw.slice(prev, pos)
                prev = pos + 1
                if (isContinue(line)) {
                    if (tokens.length === 0) {
                        const err = `first line cannot be continuation: [${line}]`
                        printer(err)
                        throw new Error(err)
                    }
                    tokens[tokens.length - 1] = ch.tokens[i]
                    continue
                }
                tokens.push(ch.tokens[i])
            }
        }
    }
    ch.mod.channels.set(vCh.name, vCh)
    return vCh
}

export function createCommentsChannel<T extends ISimpleToken>(ch: IChannel<T>): IChannel<T> {

    if (ch !== ch.mod.channels.get('vlf') && ch !== ch.mod.channels.get('lf')) {
        throw new TypeError(`source "lf/vlf" channel is not registered with a module`)
    }
    const comm: IChannel<T> = {
        mod: ch.mod,
        tokens: [], //vtokens
        name: 'comments',
        process() {
            const tokens = this.tokens = []
            let prev = 0
            for (let i = 0; i < ch.tokens.length; i++) {
                const pos = ch.tokens[i].f
                const line = ch.mod.raw.slice(prev, pos)

                if (isComment(line)) {
                    tokens.push({ f: prev, t: pos })

                }
                prev = pos + 1

            }
        }
    }
    ch.mod.channels.set(comm.name, comm)
    return comm
}