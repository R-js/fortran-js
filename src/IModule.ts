'use strict'

export enum IModuleEnums {
  'init',
  'loaded',
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
  errors: Error[];
  name: string;
  operations: Set<IModuleEnums>
  size?: number;
  raw?: string;
  lines?: string[];
  ext(): string | TypeError;
  load(): Promise<string>;
  base(): string;
  dir(): string;
  resolveDependencies(): Promise<IModule[]>;  
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
