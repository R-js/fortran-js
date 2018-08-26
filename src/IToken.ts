import { IModule, IModuleEnums } from './module';
import { propsExist } from './helpers'
export interface ISimpleToken {
    f: number;
}
export interface IRangeToken extends ISimpleToken {
    t: number;
}
export interface INameToken extends IRangeToken {
    name: string; // name of token
}

export interface Snippet extends IRangeToken {
    line: string;
}

export const isRangeToken = propsExist('f', 't')
export const isSimpleToken = propsExist('f')

export type IToken = ISimpleToken & IRangeToken

export function sortTokenFAscTDesc<T>(t1: any, t2: any) {
    if (t1.f > t2.f) return 1
    if (t1.f < t2.f) return -1
    if (isRangeToken(t1) && isRangeToken(t2)) {
        const t1t = <IRangeToken>t1
        const t2t = <IRangeToken>t2
        if (t1t < t2t) return 1
        if (t1t > t2t) return -1
    }
    return 0
}


// stream (system)
// -> lftokenizer (system) 
// -> ws tokenizer (ws) //spaces and tabs
// -> cr tokenize (\cr) => sink

// langauge-layout 
// 6 char space in beginning
// line continuation
// virtual lines (vlines) // because of line-continuation
// comments (also) also parse multiline comments!!

//parser
// -> comments 

// channel is just a collection of IToken objects  
