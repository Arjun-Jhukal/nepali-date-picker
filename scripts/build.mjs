#!/usr/bin/env node
/**
 * Build script — produces dist/ output files using esbuild.
 *
 * Outputs:
 *   dist/nepali-date-picker.all.min.js          ← full bundle (popover + inline + range)
 *   dist/nepali-date-picker.min.js              ← popover only (no inline calendar)
 *   dist/nepali-date-range-picker.min.js        ← inline calendar + range only (no popover)
 *   dist/nepali-date-picker.iife.min.js         ← alias of .all.min.js (backwards compat)
 *   dist/nepali-date-picker.esm.js              ← import { NepaliDatePicker } from '...'
 *   dist/nepali-date-picker.umd.js              ← CommonJS / AMD
 *   dist/nepali-date-picker.min.css             ← Combined CSS (light + base)
 *   dist/nepali-date-picker.dark.min.css        ← Dark theme override
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

mkdirSync(join(ROOT, 'dist'), { recursive: true });

// ---------------------------------------------------------------------------
// Calendar data — read from JSON or fall back to embedded data in existing IIFE
// ---------------------------------------------------------------------------

let calendarJsonContents = null;

const jsonPath = join(ROOT, 'src/data/bs-calendar.json');
const jsonRaw = readFileSync(jsonPath, 'utf8').trim();

if (jsonRaw) {
    calendarJsonContents = jsonRaw;
} else {
    // JSON file is the canonical source and must not be modified by the build.
    // When empty (e.g. first checkout before data is committed), fall back to
    // calendar data embedded in the previously-built IIFE bundle.
    const iifePath = join(ROOT, 'dist/nepali-date-picker.iife.min.js');
    if (existsSync(iifePath)) {
        const iifeText = readFileSync(iifePath, 'utf8');
        // The calendar object looks like {"2082":[31,31,…],"2083":[…],…}
        const m = iifeText.match(/\{"2082":\[\d+(?:,\d+)*\](?:,"20\d\d":\[\d+(?:,\d+)*\])+\}/);
        if (m) {
            calendarJsonContents = m[0];
            console.log('ℹ  bs-calendar.json is empty — using calendar data from existing IIFE bundle.');
        }
    }
    if (!calendarJsonContents) {
        throw new Error(
            'bs-calendar.json is empty and no existing IIFE bundle found to extract data from.\n' +
            'Please populate src/data/bs-calendar.json before building.',
        );
    }
}

// esbuild plugin that serves the (possibly recovered) calendar data in-memory
// so the source JSON file is never modified.
const calendarPlugin = {
    name: 'calendar-data',
    setup(build) {
        build.onLoad({ filter: /bs-calendar\.json$/ }, () => ({
            contents: calendarJsonContents,
            loader: 'json',
        }));
    },
};

// ---------------------------------------------------------------------------
// JavaScript builds
// ---------------------------------------------------------------------------

const commonConfig = {
    entryPoints: [join(ROOT, 'src/index.ts')],
    bundle: true,
    resolveExtensions: ['.ts', '.js', '.json'],
    loader: { '.json': 'json' },
    plugins: [calendarPlugin],
};

const VERSION = getVersion(ROOT);
const banner = (kind) => ({
    js: `/* @nepali-date/picker v${VERSION} (${kind}) | MIT License | https://github.com/Arjun-Jhukal/nepali-date-picker */`,
});

// IIFE — full bundle (popover + inline + range)
await build({
    ...commonConfig,
    entryPoints: [join(ROOT, 'src/iife-all.ts')],
    format: 'iife',
    minify: true,
    outfile: join(ROOT, 'dist/nepali-date-picker.all.min.js'),
    plugins: [calendarPlugin],
    banner: banner('all'),
});

// Backwards-compat alias of the .all bundle, same file content under the old name.
copyFileSync(
    join(ROOT, 'dist/nepali-date-picker.all.min.js'),
    join(ROOT, 'dist/nepali-date-picker.iife.min.js'),
);

// IIFE — popover picker only (no inline calendar)
await build({
    ...commonConfig,
    entryPoints: [join(ROOT, 'src/iife-picker.ts')],
    format: 'iife',
    minify: true,
    outfile: join(ROOT, 'dist/nepali-date-picker.min.js'),
    plugins: [calendarPlugin],
    banner: banner('picker'),
});

// IIFE — inline calendar + range picker only (no popover)
await build({
    ...commonConfig,
    entryPoints: [join(ROOT, 'src/iife-range.ts')],
    format: 'iife',
    minify: true,
    outfile: join(ROOT, 'dist/nepali-date-range-picker.min.js'),
    plugins: [calendarPlugin],
    banner: banner('range'),
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

const cssBanner = `/* @nepali-date/picker v${VERSION} | MIT License */\n`;

writeFileSync(
    join(ROOT, 'dist/nepali-date-picker.min.css'),
    cssBanner + minifyCss(lightCss + '\n' + baseCss),
);

writeFileSync(
    join(ROOT, 'dist/nepali-date-picker.dark.min.css'),
    cssBanner + minifyCss(darkCss),
);

// ---------------------------------------------------------------------------
// TypeScript declarations
// ---------------------------------------------------------------------------

execSync('node node_modules/typescript/bin/tsc', { stdio: 'inherit' });

const outputs = [
    'nepali-date-picker.all.min.js',
    'nepali-date-picker.min.js',
    'nepali-date-range-picker.min.js',
    'nepali-date-picker.iife.min.js',
    'nepali-date-picker.esm.js',
    'nepali-date-picker.umd.js',
    'nepali-date-picker.min.css',
    'nepali-date-picker.dark.min.css',
];

console.log('\n✓ Build complete. dist/ outputs:');
for (const name of outputs) {
    const bytes = statSync(join(ROOT, 'dist', name)).size;
    console.log(`  ${name.padEnd(40)} ${(bytes / 1024).toFixed(2).padStart(7)} KB`);
}
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
