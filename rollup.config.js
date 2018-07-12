import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json'
import pkg from './package.json'


const onwarn = warning => {
  // Silence circular dependency warning for moment
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return
  }

  console.warn(`(!) ${warning.message}`)
}

export default [
	// browser-friendly UMD build
	{
		onwarn,
		input: 'src/index.js',
		output: {
			name: 'howLongUntilLunch',
			file: pkg.browser,
			format: 'umd',
			globals: {
				'url' : 'url' 
			}
		},
		plugins: [
			json(),
			globals(),
			builtins(),
			resolve(),
			commonjs()
		]
	},
	
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		onwarn,
		input: 'src/index.js',
		external: ['axios'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
]