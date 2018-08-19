
export const isString = s => typeof s === 'string'
export const cc = '\u0020'
export const _ = undefined

export const isComment = c => '*cC'.includes(c[0])
export const isContinue = function (c: string) {
  return c.startsWith('    ') && c[5] !== ' '
}

// Split the array into halves and merge them recursively 
export function mergeSort(sort =  (a, b) => a - b) {

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

/*
function binary_search(A, n, T):
    L := 0
    R := n − 1
    while L <= R:
        m := floor((L + R) / 2)
        if A[m] < T:
            L := m + 1
        else if A[m] > T:
            R := m - 1
        else:
            return m
    return unsuccessfu
  // compare the arrays item by item and return the concatenated result
*/

export function binarySearch<T> (list: T[], compare: (a:T,b:T) => number, value: T) {
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)

  // While the middle is not what we're looking for and the list does not have a single item
  let comp = compare(list[middle], value)
  while (comp !== 0 && start < stop) {
    if (comp > 0) {
      stop = middle - 1
    } else {
      start = middle + 1
    }
    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2)
    comp = compare(list[middle], value)
  }

  // if the current middle item is what we're looking for return it's index, 
  //    else return -middle (insertion position)
  return comp === 0 ? middle : -middle
}

//const list = [2, 5, 8, 9, 13, 45, 67, 99]
///console.log(binarySearch(list, 99)) // 7 -> returns the index of the item



  //const list = [2, 5, 1, 3, 7, 2, 3, 8, 6, 3]
  //console.log(mergeSort(list)) // [ 1, 2, 2, 3, 3, 3, 5, 6, 7, 8 ]