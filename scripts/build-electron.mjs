import { build } from 'esbuild'

const commonOptions = {
    outdir: 'dist-electron',
    outbase: 'electron',
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    bundle: false,
    sourcemap: false,
    logLevel: 'info',
}

await build({
    ...commonOptions,
    entryPoints: [
        'electron/main.ts',
        'electron/preload.ts',
        'electron/server/index.ts',
    ],
})
