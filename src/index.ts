import { createModule } from './module'
import {
    createChannel,
    createLogicalEOLChannel,
    createChannelExcluding
} from './channel'

import {
    EStats,
    aLoad,
    lsDir,
    load,
    fstat,
    statEntries,
    statDirEntries
} from './fsutils'

import {
    last,
    propsExist,
    mergeSort,
    binarySearch
} from './helpers'


import {
    ISimpleToken,
    IRangeToken,
    INameToken,
    Snippet,
    isRangeToken,
    isSimpleToken,
    IToken,
    sortTokenFAscTDesc
} from './IToken'

const fs2 = Object.freeze({
    aLoad,
    lsDir,
    load,
    fstat,
    statEntries,
    statDirEntries
})

const helper = Object.freeze({
    last,
    propsExist,
    mergeSort,
    binarySearch
})


import {
    // compositions
    processLineContinuation,
    processWS,
    processComments,
    processLf,
    chain,
    // fundamental routines
    compose,
    createProcessor,
    createSnippetsUsingTokens,
    // interfaces
    Processed

} from './processors'

import { init } from './test'

export {
    // interfaces
    EStats,
    Processed,
    ISimpleToken,
    IRangeToken,
    INameToken,
    IToken,
    Snippet,
    // compositions
    processLineContinuation,
    processWS,
    processComments,
    processLf,
    chain,
    // fundamental routines
    compose,
    createProcessor,
    createSnippetsUsingTokens,
    // interfaces
    createChannel,
    createModule,
    createLogicalEOLChannel,
    createChannelExcluding,
    //test
    init,
    //file tools
    fs2,
    // general
    helper,
    // IToken
    isRangeToken,
    isSimpleToken,
    sortTokenFAscTDesc,
}

export default {
    // compositions
    processLineContinuation,
    processWS,
    processComments,
    processLf,
    chain,
    // fundamental routines
    compose,
    createProcessor,
    createSnippetsUsingTokens,
    // interfaces
    createChannel,
    createModule,
    createLogicalEOLChannel,
    mergeSort,
    binarySearch,
    createChannelExcluding,
    //test
    init,
    // filetools
    fs2,
    //general
    helper,
    // IToken
    isRangeToken,
    isSimpleToken,
    sortTokenFAscTDesc,
}

