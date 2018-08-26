
import * as F77 from './'
import { tokenAsSimple, tokenAsRange } from './channel';


const { resolve } = require('path')

const {
    // compositions
    processLineContinuation,
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
} = F77

const fullPath = resolve('test/dhgeqz.f')
const mod77 = F77.createModule(fullPath)

const lfChannel = createChannel('lf', tokenAsSimple)(chain(processLf))()
const commentsChannel = createChannel('comms', tokenAsRange)(chain(processComments))

export function init() {

    mod77.load().then(mod => {
        const raw = mod.raw
        const lfc = lfChannel(raw)
        lfc.process()
        const commSprint = () => {
            return {
                data:raw,
                slicers: lfc.tokens
            } 
        }
        const comc = commentsChannel(commSprint)(raw)
        comc.process()
        const 
        
        
        //wsChannel.process()
        //const vlfChannel = createLogicalEOLChannel(lfChannel)
        //vlfChannel.process()
        //const commChannel = createCommentsChannel(vlfChannel)
        //commChannel.process()
        //const sourceChannel = createChannelExcluding('source', vlfChannel, commChannel);
        //sourceChannel.process()
        //const whiteSpaceChannel = createWSChannel(sourceChannel);
        //whiteSpaceChannel.process()
        //channel = mod.channels.get('lf')
        comc.tokens.forEach((v, i, arr) => {
            console.log(`${`${i}`.padStart(4, '0')}: ${raw.slice(v.f, v.t + 1)}`)
        })
    })

}
