import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import svgr from '@svgr/rollup';
import packageJson from "./package.json" assert { type: "json" };
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import tailwindcss from 'tailwindcss';
import tailwindConfig from './tailwind.config.js';

export default [
    {
        input: 'src/index.ts',
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
            peerDepsExternal(),
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
                plugins: [tailwindcss(tailwindConfig)]
            }),
        ],
        external: ['react']
    },
    {
        input: 'dist/esm/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.(css|less|scss)$/],
    }
];
