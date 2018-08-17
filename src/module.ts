'use strict'

//import { load, lsDir, fstat } from './fsutils';

import { IModule, IModuleEnums } from './IModule';

export function createModule(fullPath: string): IModule  {
    
    return {
        operations: [IModuleEnums.init],
        size: -1,
        raw: '',
        lines: [],
        inferFiletype(){
        },
        load() {
        },
        resolveDependencies(){

        }
    }
}