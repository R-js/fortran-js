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
    aLoad
} = f77

const mod77 = f77.createModule(resolve('test/dhgeqz.f'))

const lfMatcher = createClassMatcher(lf)
const wsMatcher = createClassMatcher(ws,'>1')

const lfEmitter = createTokenEmitter(simpleProducer, lfMatcher)
const wsEmitter = createTokenEmitter(rangeProducer, wsMatcher)

const lfChannel = createChannel( 'lf' )( lfEmitter )( mod77 )
const wsChannel = createChannel( 'ws' )( wsEmitter )( mod77 )

mod77.load().then(mod=>{
    lfChannel.process()
    wsChannel.process()
    channel = mod.channels.get('lf')
    const hist = new Map()
    channel.tokens.reduce( (map, v, i, arr) => {
        const delta =  (v.t && ( v.t - v.f + 1 )) || 1
        let len = map.get(delta) || 0
        len += delta
        map.set(delta, len)
        return map
    }, hist)
    const e = Array.from(hist.entries()).sort((a,b)=>a[0]-b[0])
    e.forEach(eb=>console.log('\n>',eb[0],eb[1]))
})






