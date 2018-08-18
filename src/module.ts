'use strict'

import { basename, dirname, extname } from 'path';
import debug from 'debug'

import { load } from './fsutils'
import { IFortranTypes, IModule, IModuleEnums } from './IModule';
import { listeners } from 'cluster';

const printer = debug('module')


export function createModule(fullPath: string): IModule {

    return {
        errors: [],
        name: fullPath,
        operations: new Set<IModuleEnums>(),
        size: -1,
        raw: '',
        lines: [],
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
            return load(fullPath, 'utf8')
                .then(raw => {
                    if (typeof raw === 'string') {
                        this.size = raw.length;
                        this.lines = raw.split(/\n/)
                        // correct for last empty line because of split side effect
                        if (!!this.lines[this.lines.length - 1]) this.lines.pop()
                        return this.raw = raw
                    }
                    throw new Error(`Read content of file ${this.base()} is NOT a string`)

                })
                .catch(err => {
                    this.operations.add(IModuleEnums.loaded)
                    return Promise.reject(err)
                })
        },
        resolveDependencies() {
            return 1 as any//Promise.reject(Error('not implemented')
        }
    }
}

