import { IModule, IModuleEnums } from './module';

export interface ISimpleToken {
    f: number;
}
export interface IRangeToken extends ISimpleToken {
    t: number;
}
export interface IToken extends IRangeToken {
    name: string; // name of token
}

export interface ILines {
    _module: IModule; // reference, not a copy
    _EOLMarkers: ISimpleToken[];
    _vEOLMarkers: ISimpleToken[];
    lines(): string[];
    line(n: number): string;
    vlines(): string[];
    vline(n: number): string;
}
export interface IWhiteSpaces {
    _module: IModule; // reference, not a copy
    _tokens: IToken[];
    onLine(n: number): IToken[];
    onvLine(n: number): IToken[];
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

export function processLines(module: IModule): void {
    

}


export function createVirtualLines(lines: ILines): void {

}