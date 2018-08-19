import * as debug from 'debug'

import { ISimpleToken, IRangeToken } from './IToken';
import { IModule, IModuleEnums } from './module'
import { IMatcher, IMatcherState } from './matchers'
import { ITokenEmitter } from './tokenProducers'

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
                    this.tokens =[] //clear
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

export function createVirtualEOLChannel<T extends ISimpleToken>(name: string, ch: IChannel<T>) : IChannel<T> {
   
    if (ch.name !== 'lf'){
        throw new TypeError(`channel not the "lf" channel`)
    }
    if (ch !== ch.mod.channels.get('lf')){
        throw new TypeError(`source "lf" channel is not registered with a module`)
    }
    const vCh:IChannel<T> = {
        mod: ch.mod,
        tokens:[], //vtokens
        name,
        process(){
            
        }
    }
    return vCh
}