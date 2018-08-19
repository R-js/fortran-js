import { lstat, readdir, readFile, Stats } from 'fs'

export interface EStats extends Stats {
    error: NodeJS.ErrnoException
}

export function promisify<T>(fn: Function): (...args) => Promise<T> {
    return function wrapped(...args) {
        return new Promise<T>((resolve, reject) => {
            fn(...args, (err, stuff: T) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(stuff)
            })
        })
    }
}

export const aLoad = function (path: string, options: any) {
    return new Promise((resolve, reject) => {
        readFile(path, options, (err, data) => {
            if (err){
                reject(err)
                return
            }
            resolve(data)
        })
    })
}

export const load = promisify<string>(readFile)
export const lsDir = promisify<string[]>(readdir)
export const fstat = promisify<EStats>(lstat)

export async function statEntries(files: string[]): Promise<Map<string, EStats>> {

    const sorted = (files || []).sort().filter(f => String.prototype.trim.call(f || ''))
    const result = new Map<string, EStats>()
    return new Promise<Map<string, EStats>>(async function (resolve) {
        //1. fire them off in parallel
        const allPromises = sorted.map(file => fstat(file))
        //2. collect them in serial
        for (let i = 0; i < allPromises.length; i++) {
            let _st
            try {
                _st = await allPromises[i]
            }
            catch (e) {
                _st.error = e
            }
            result.set(sorted[i], _st)
        }
        resolve(result)
        return
    })
}

export async function statDirEntries(dirName: string) {
    return lsDir(dirName).then(statEntries)
}
