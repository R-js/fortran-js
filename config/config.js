'use strict'

const { resolve } = require('path')

const wbtb = require('webpack-toolbox');
const { plugin: { wPackNodeExternals, rm, uglify }, rule: { tslinter, tsc} } = wbtb;

module.exports = function(env) {

    const configFile = resolve('./tsconfig.json')
    const tsconfigFile = resolve('./tslint.json') 

    const configs = [{
        target: 'node',
        entry: {
            f77: resolve('src/index.ts'),
            'f77.min': resolve('src/index.ts')
        },
        output: {
            path: resolve('dist/'),
            filename: '[name].js',
            libraryTarget: 'umd2',
            library: 'F77'
        },
        devtool: 'source-map',
        externals: [wPackNodeExternals({ whitelist: ['debug','ms'] })],
        module: {
            rules:[
                tslinter({
                    configFile,
                    tsconfigFile
                }),
                tsc({ configFile })
            ]
        },
        plugins: [
            rm({ 
                paths: ['src', './'],
                // This is a default but we mention in explicitly here 
            //    root: resolve('dist') 
            })
        ],
    }]
    //env specific adjustments
    if (/prod/i.test(env)) {
        configs.forEach(conf => conf.plugins.push(uglify()))
    }

    configs.forEach(conf => {
        conf.module.rules.forEach(rule => {
            rule.include = rule.include || []
            rule.include.push(resolve('src'))
        })
    })
    return configs
}