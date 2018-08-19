import { createModule } from './module'
import { createClassMatcher, createLiteralMatcher } from './matchers'
import { simpleProducer, rangeProducer, createTokenEmitter }  from './tokenProducers'
import { lf, ws } from './classes'
import { createChannel } from './channel'
import { aLoad } from './fsutils'

export {
    aLoad,  
    createClassMatcher,   
    createLiteralMatcher,
    simpleProducer, rangeProducer,
    createTokenEmitter,
    createChannel,
    lf,
    ws,
    createModule
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
    createModule
}

