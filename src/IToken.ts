
export interface IChannle

export interface IToken {
    iName: string;
    pos: ITokenPosition 
}

export interface ITokenPosition {
   from: number;
   to: number; //inclusive
   line(): number;
   value(): string;
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
