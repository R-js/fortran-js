
import * as F77 from './'
import { tokenAsSimple, tokenAsRange } from './channel';


const { resolve } = require('path')

const {
    // compositions
    processLineContinuation,
    processComments,
    processLf,
    processWS,
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

        const eol = createLogicalEOLChannel(lfc, raw)
        eol.process()

        const commSpring = () => {
            return {
                data:raw,
                slicers: lfc.tokens
            } 
        }
        const comc = commentsChannel(commSpring)(raw)
        comc.process()

        const src = createChannelExcluding('source',raw, eol, comc)
        src.process()

        const wsSpring = () => {
            return {
                data: raw,
                slicers: src.tokens
            }
        }
        const ws = createChannel('ws', tokenAsRange)(chain(processLineContinuation, processWS))(wsSpring)(raw)
        ws.process()
        
        ws.tokens.forEach((v, i, arr) => {
            console.log(`${`${i}`.padStart(4, '0')}: ${raw.slice(v.f, v.t + 1)}<`)
        })
    })

}
