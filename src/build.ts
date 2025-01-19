import * as esbuild from 'npm:esbuild';

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/main.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  external: ['three'],
}); 