import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import pkg from './package.json'

export default [
	{
		input: 'src/main.js',
		exports: 'named',
		sourcemap: true,
		output: {
			name: 'capsuleHttp',
			file: pkg.module,
			format: 'umd'
		},
		plugins: [
			resolve({
				modulesOnly: true
			}),
			json(),
			commonjs({
				namedExports: { './src/module.js': ['foo', 'bar' ] }
			})
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'src/main.js',
		external: ['axios', 'axios-extensions'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.browser, format: 'es' }
		]
	}
]
