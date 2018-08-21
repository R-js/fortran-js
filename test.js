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
    mergeSort,
    binarySearch
} = f77

const mod77 = f77.createModule(resolve('test/dhgeqz.f'))

const lfMatcher = createClassMatcher(lf)
const wsMatcher = createClassMatcher(ws, '>1')

const lfEmitter = createTokenEmitter(simpleProducer, lfMatcher)
const wsEmitter = createTokenEmitter(rangeProducer, wsMatcher)

const lfChannel = createChannel('lf')(lfEmitter)(mod77)
const wsChannel = createChannel('ws')(wsEmitter)(mod77)

mod77.load().then(mod => {
    lfChannel.process()
    wsChannel.process()
    const vlfChannel = createLogicalEOLChannel(lfChannel)
    vlfChannel.process()
    const commChannel = createCommentsChannel(vlfChannel)
    commChannel.process()
    //channel = mod.channels.get('lf')
    commChannel.tokens.forEach((v, i, arr) => {
        console.log(`${`${i}`.padStart(4, 0)}: ${commChannel.mod.raw.slice(v.f, v.t)}`)
    })

    const arr = [
        { a: -5, pl: 'hi' },
        { a: -10, pl: 'world' }
    ]

    const fnSort = (a, b) => a.a - b.a
    const sorted = mergeSort(fnSort)(arr)

    const found = binarySearch(fnSort)(sorted, { a: -11 })

    console.log(JSON.stringify(sorted), found)

})






