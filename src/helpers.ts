
export const isString = s => typeof s === 'string'
export const cc = '\u0020'
export const _ = undefined

export const isComment = c => '*cC'.includes(c[0])
export const isContinue = function (c: string) {
    return c.startsWith('    ') && c[5] !== ' '
}