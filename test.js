const f77 = require('./dist')
const {resolve} = require('path')

const mod77 = f77.modules.createModule(resolve('test/dhgeqz.f'))

mod77.load().then(raw=> console.log('raw>>:', raw))

mod77.size

