'use strict'

export enum IModuleEnums {
  'init',
  'dependencies-resolved',
  'lexed',
  'parsed'
}

export enum IFortranTypes {
  'f90',
  'f95',
  'f03',
  'F',
  'f77',
  'f'
}

export interface IModule {
  operations: IModuleEnums[]
  size?: number;
  raw?: string;
  lines?: string[];
  inferFiletype(): void;
  load(): void;
  resolveDependencies(): void;  
}

/*
 {
    fileName: 
    size:
    type:(mostly extentions)
    channels Map
       //lf channel
        //ws channel
    tokens
    raw
    lines[] // 
     //fun
    lexIt
    profile
    load
    resolve
 }
*/