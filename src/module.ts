'use strict'

import { basename, dirname, extname } from 'path';

import debug from 'debug'

import { aLoad } from './fsutils'
import { IChannel } from './channel'

const printer = debug('module')

export enum IFortranTypes {
    'f90',
    'f95',
    'f03',
    'F',
    'f77',
    'f'
}

export enum IModuleEnums {
    'init',
    'loaded',
    'lf_processed',
    'vlf_processed',
    'comms_processed',
    'source_extracted',
    'ws_processed',
    'dependencies_resolved',
    'lexed',
    'parsed'
}


export interface IModule {
    name: string;
    state: Set<IModuleEnums>
    size?: number;
    raw?: string;
    channels: Map<string, IChannel<any>>;
    //intrinsic channels
    //aux
    ext(): string | TypeError;
    load(): Promise<IModule>;
    base(): string;
    dir(): string;
    resolveDependencies(): Promise<IModule[]>;
    resetStateTo(state: IModuleEnums): void;
}

export function createModule(fullPath: string): IModule {

    const module: IModule = {
        name: fullPath,
        channels: new Map(),
        state: new Set<IModuleEnums>(),
        size: -1,
        raw: '',
        //lines: [{}],
        ext() {
            const found = Object.keys(IFortranTypes).find(f => f === extname(fullPath))
            if (!found) {
                printer(`extention of ${this.base(fullPath)} does not have fortran extention`)
                return new TypeError(`not a valid fortran extentiontype: ${basename(fullPath)}`)
            }
            return found
        },
        base() {
            return basename(this.name)
        },
        dir() {
            return dirname(this.name)
        },
        load() {
            return aLoad(fullPath, 'utf8')
                .then(raw => {
                    if (typeof raw !== 'string') {
                        throw new Error(`Read content of file ${this.base()} is NOT a string`)
                    }
                    module.size = raw.length;
                    module.raw = raw
                    module.state.add(IModuleEnums.loaded)
                    return module
                })
        },
        resolveDependencies() {
            return 1 as any//Promise.reject(Error('not implemented')
        },
        resetStateTo(state: IModuleEnums): void {

            const strLevel = IModuleEnums[state]
            const level = IModuleEnums[strLevel]
            Object.keys(IModuleEnums).forEach(ms => {
                if (ms > level) {
                    this.state.delete(ms)
                }
            })
        }
    }
    return module
}

