/* global require process*/

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
//import replace from 'rollup-plugin-replace';

let pkg = require('./package.json');

export default {
    entry: 'src/index.js',
    external:  Object.keys(pkg.dependencies || {}),
    plugins: [
        babel({
            babelrc: false,
            exclude: 'node_modules/**',
            runtimeHelpers: true,
            presets: [
              [ 'es2015', { modules: false } ],
              [ 'stage-0' ],
            ],
            plugins: [
                'external-helpers'
            ]
        }),
        //replace({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
        nodeResolve({
            module: true,
            jsnext: true,
            main: true,
            preferBuiltins: false
        })
    ],
    targets: [
        {
            dest: pkg['module'],
            format: 'es',
            moduleName: pkg.name,
            sourceMap: true
        },
        {
            dest: pkg['main'],
            format: 'umd',
            moduleName: pkg.name,
            sourceMap: true
        }
    ]
};
