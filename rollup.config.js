// Rollup configuration
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import pkjson from './package.json';
import babelrc from './.babelrc.json'

const banner = `/*!
* Proton v${pkjson.version}
* https://github.com/JackXie60/shader-particle-system
* Copyright 2022-${new Date().getFullYear()}, JackXie60
* Licensed under the MIT license
* http://www.opensource.org/licenses/mit-license
*
*/`;

const input = 'src/index.ts';
const isDev = process.env.NODE_ENV === "dev";

let rconfig;
if (isDev) {
    rconfig = {
        input,
        external: ['three'],
        output: {
            file: 'build/shader-particle-system.js',
            format: 'umd',
            name: 'shader-particle-system',
            sourcemap: true,
            globals: {
                three: 'THREE'
            },
            exports: 'named'
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            babel({
                babelHelpers: 'bundled',
                compact: false,
                babelrc: false,
                ...babelrc,
                exclude: 'node_modules/**'
            })
        ]
    }
} else {
    rconfig = {
        input,
        external: ['three'],
        output: {
            file: 'build/shader-particle-system.min.js',
            format: 'umd',
            name: 'shader-particle-system',
            sourcemap: true,
            globals: {
                three: 'THREE'
            },
            exports: 'named'
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            babel({
                exclude: "node_modules/**",
                babelHelpers: "bundled",
                babelrc: false,
                ...babelrc
            }),
            terser(),
            license({ banner })
        ]
    }
}

export default rconfig;