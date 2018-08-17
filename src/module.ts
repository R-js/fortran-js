'use strict'

import { basename, dirname, extname } from 'path';

import { load } from './fsutils'
import { IFortranTypes, IModule, IModuleEnums } from './IModule';

export function createModule(fullPath: string): IModule  {
    
    return {
        errors: [],
        name:fullPath,
        operations: new Set<IModuleEnums>(),
        size: -1,
        raw: '',
        lines: [],
        ext(){
           const found = Object.keys(IFortranTypes).find(f => f === extname(fullPath)) 
           if (!found){
               return new TypeError(`not a valid fortran extentiontype: ${basename(fullPath)}`)
           }
           return found       
        },
        base(){
            return basename(this.name)
        },
        dir(){
            return dirname(this.name) 
        },
        async load() {
            let text: string
            try {
             text = await load(fullPath)
             this.raw = text
             this.operations.add(IModuleEnums.loaded)
            }
            catch (e){
                this.errors.push(e)
                throw e
            }
            return text
        },
        async resolveDependencies() {
            throw new Error('not implemented')
        }
    }
}

