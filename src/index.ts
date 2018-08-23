import { createModule } from './module'
import { createClassMatcher, createLiteralMatcher } from './matchers'
import { simpleProducer, rangeProducer, createTokenEmitter }  from './tokenProducers'
import { lf, ws } from './classes'
import { 
    createChannel, 
    createLogicalEOLChannel, 
    createCommentsChannel,
    createProcessor,
    createWSChannel,
    createSourceChannel,
    

} from './channel'
import { aLoad } from './fsutils'
import { mergeSort, binarySearch } from './helpers'

export {
    aLoad,  
    createClassMatcher,   
    createLiteralMatcher,
    simpleProducer, rangeProducer,
    createTokenEmitter,
    createChannel,
    lf,
    ws,
    createModule,
    createLogicalEOLChannel,
    createCommentsChannel,
    mergeSort,
    binarySearch,
    createProcessor,
    createWSChannel,
    createSourceChannel
}

export default {
    aLoad,
    createClassMatcher,   
    createLiteralMatcher,
    simpleProducer, rangeProducer,
    createTokenEmitter,
    createChannel,
    lf,
    ws,
    createModule,
    createLogicalEOLChannel,
    createCommentsChannel,
    mergeSort,
    binarySearch,
    createProcessor,
    createWSChannel,
    createSourceChannel
}

