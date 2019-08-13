import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const { ENVIRONMENT } = process.env;

const defaultOutput = {
    input: 'src/index.ts',
    plugins: [typescript(), commonjs(), resolve()],
};

const iifeBuild = {
    ...defaultOutput,
    output: {
        file: 'dist/mparticle-media.iife.js',
        format: 'iife',
        name: 'MediaSession',
        sourcemap: ENVIRONMENT !== 'prod',
    },
};

const cjsBuild = {
    ...defaultOutput,
    output: {
        file: 'dist/mparticle-media.common.js',
        format: 'cjs',
        sourcemap: ENVIRONMENT !== 'prod',
    },
};

export default [iifeBuild, cjsBuild];
