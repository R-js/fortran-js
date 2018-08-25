
export const isString = s => typeof s === 'string'
export const cc = '\u0020'
export const _ = undefined

export const isComment = c => '*cC'.includes(c[0])
export const isContinue = function (c: string) {
  return c.startsWith('    ') && c[5] !== ' '
}

// Split the array into halves and merge them recursively 
export function mergeSort(sort = (a, b) => a > b ? 1 : a < b ? -1 : 0) {

  function merge(left, right) {
    let result = []
    let indexLeft = 0
    let indexRight = 0

    while (indexLeft < left.length && indexRight < right.length) {
      if (sort(left[indexLeft], right[indexRight]) < 0) {
        result.push(left[indexLeft])
        indexLeft++
      } else {
        result.push(right[indexRight])
        indexRight++
      }
    }
    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
  }

  return function splitIn2(arr: any[]) {
    if (arr.length === 1) {
      // return once we hit an array with a single item
      return arr
    }

    const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
    const left = arr.slice(0, middle) // items on the left side
    const right = arr.slice(middle) // items on the right side

    return merge(
      splitIn2(left),
      splitIn2(right)
    )
  }
}

export function binarySearch<T>(compare: (a: T, b: T) => (0 | 1 | -1)) {

  return function useArr(list: T[], value: T) {
    // initial values for start, middle and end
    let start = 0
    let stop = list.length - 1
    do {
      const middle = (stop + start) >> 1
      const comp = compare(list[middle], value)
      if (comp === 0) {
        return { found: true, idx: middle }
      }
      if (comp > 0 && middle === 0) {
        return { found: false, idx: middle }
      }
      if (comp < 0 && middle === list.length - 1) {
        return { found: false, idx: middle + 1 }
      }
      if (stop === start) {
        return { found: false, idx: middle }
      }
      if (comp > 0) {
        stop = middle - 1
      } else {
        start = middle + 1
      }
    } while (true)

  }
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1]
}

export const propsExist = (...rest) => obj => {
  if (!rest.length) return false
  return !rest.find(propName => !Object.getOwnPropertyDescriptor(obj || {}, propName))
}


