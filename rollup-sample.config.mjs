import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import svgr from '@svgr/rollup';
import packageJson from "./package.json" with { type: "json" };
import dts from "rollup-plugin-dts";
// import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const NODE_ENV = process.env.NODE_ENV || "development";

export default [
    {
        input: 'src/index-sample.tsx',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: false,
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: false,
            },
        ],       
        plugins: [
            // peerDepsExternal(),
            replace({
                "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
                preventAssignment: true,
            }),
            nodeResolve(),
            commonjs(),
            typescript({
                sourceMap: false,
                inlineSources: false,
            }),
            svgr(),
            postcss({
                config: {
                    path: './postcss.config.mjs'
                },
                extensions: ['.css'],
                minimize: true,
                inject: {
                    insertAt: 'top'
                },
            }),
            babel({
                babelHelpers: 'bundled',
                exclude: "node_modules/**"
            }),
        ],
        // external: ['react']
    },
    {
        input: 'dist/esm/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.(css|less|scss)$/],
    }
];
