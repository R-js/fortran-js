const f77 = require('./dist')
const { resolve } = require('path')

const {
    lf,
    ws,
    createClassMatcher,
    createLiteralMatcher,
    simpleProducer, rangeProducer,
    createTokenEmitter,
    createChannel,
    aLoad,
    createLogicalEOLChannel,
    createCommentsChannel,
    createChannelExcluding,
    createWSChannel,
    mergeSort,
    binarySearch
} = f77

const mod77 = f77.createModule(resolve('test/dhgeqz.f'))


const wsMatcher = createClassMatcher(ws, '>1')
const wsEmitter = createTokenEmitter(rangeProducer, wsMatcher)
const wsChannel = createChannel('ws')(wsEmitter)(mod77)

const lfMatcher = createClassMatcher(lf)
const lfEmitter = createTokenEmitter(simpleProducer, lfMatcher)
const lfChannel = createChannel('lf')(lfEmitter)(mod77)


mod77.load().then(mod => {
    const raw = mod.raw
    lfChannel.process()
    wsChannel.process()
    const vlfChannel = createLogicalEOLChannel(lfChannel)
    vlfChannel.process()
    const commChannel = createCommentsChannel(vlfChannel)
    commChannel.process()
    const sourceChannel = createChannelExcluding('source', vlfChannel, commChannel);
    sourceChannel.process()
    const whiteSpaceChannel = createWSChannel(sourceChannel);
    whiteSpaceChannel.process()
    //channel = mod.channels.get('lf')
    sourceChannel.tokens.forEach((v, i, arr) => {
        console.log(`${`${i}`.padStart(4, 0)}: ${raw.slice(v.f, v.t+1)}`)
    })
/*
    const arr = [
        { a: -5, pl: 'hi' },
        { a: -10, pl: 'world' }
    ]

    const fnSort = (a, b) => a.a - b.a
    const sorted = mergeSort(fnSort)(arr)
    const found = binarySearch(fnSort)(sorted, { a: -11 })
    console.log(JSON.stringify(sorted), found)
*/
})






