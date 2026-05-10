#!/usr/bin/env node
/**
 * Build script — produces dist/ output files using esbuild.
 *
 * Outputs:
 *   dist/nepali-date-picker.iife.min.js   ← <script> tag, window.NepaliDatePicker
 *   dist/nepali-date-picker.esm.js        ← import { NepaliDatePicker } from '...'
 *   dist/nepali-date-picker.umd.js        ← CommonJS / AMD
 *   dist/nepali-date-picker.min.css       ← Combined CSS (light + base)
 *   dist/nepali-date-picker.dark.min.css  ← Dark theme override
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

mkdirSync(join(ROOT, 'dist'), { recursive: true });

// ---------------------------------------------------------------------------
// JavaScript builds
// ---------------------------------------------------------------------------

const commonConfig = {
    entryPoints: [join(ROOT, 'src/index.ts')],
    bundle: true,
    resolveExtensions: ['.ts', '.js', '.json'],
    loader: { '.json': 'json' },
};

// IIFE (script tag) — exposes window.NepaliDatePicker
await build({
    ...commonConfig,
    entryPoints: [join(ROOT, 'src/iife-entry.ts')],
    format: 'iife',
    minify: true,
    outfile: join(ROOT, 'dist/nepali-date-picker.iife.min.js'),
    banner: {
        js: `/* @nepali-date/picker v${getVersion(ROOT)} | MIT License | https://github.com/nepali-date/picker */`,
    },
});

// ESM
await build({
    ...commonConfig,
    format: 'esm',
    minify: false,
    outfile: join(ROOT, 'dist/nepali-date-picker.esm.js'),
});

// UMD (CJS compatible — esbuild doesn't do UMD natively, use CJS + wrapper)
await build({
    ...commonConfig,
    format: 'cjs',
    minify: true,
    outfile: join(ROOT, 'dist/nepali-date-picker.umd.js'),
});

// ---------------------------------------------------------------------------
// CSS build — concatenate and write
// ---------------------------------------------------------------------------

const lightCss = readFileSync(join(ROOT, 'src/styles/themes/light.css'), 'utf8');
const baseCss = readFileSync(join(ROOT, 'src/styles/picker.css'), 'utf8');
const darkCss = readFileSync(join(ROOT, 'src/styles/themes/dark.css'), 'utf8');

const banner = `/* @nepali-date/picker v${getVersion(ROOT)} | MIT License */\n`;

writeFileSync(
    join(ROOT, 'dist/nepali-date-picker.min.css'),
    banner + minifyCss(lightCss + '\n' + baseCss),
);

writeFileSync(
    join(ROOT, 'dist/nepali-date-picker.dark.min.css'),
    banner + minifyCss(darkCss),
);

// ---------------------------------------------------------------------------
// TypeScript declarations
// ---------------------------------------------------------------------------

execSync('node node_modules/typescript/bin/tsc', { stdio: 'inherit' });

console.log('✓ Build complete. dist/ files:');
console.log('  nepali-date-picker.iife.min.js');
console.log('  nepali-date-picker.esm.js');
console.log('  nepali-date-picker.umd.js');
console.log('  nepali-date-picker.min.css');
console.log('  nepali-date-picker.dark.min.css');
console.log('  types/index.d.ts  (+ all declarations)');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVersion(root) {
    try {
        const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        return pkg.version;
    } catch {
        return '0.0.0';
    }
}

function minifyCss(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')  // remove comments
        .replace(/\s+/g, ' ')              // collapse whitespace
        .replace(/\s*([{}:;,>~+])\s*/g, '$1') // remove space around punctuation
        .replace(/;}/g, '}')              // remove trailing semicolons
        .trim();
}
