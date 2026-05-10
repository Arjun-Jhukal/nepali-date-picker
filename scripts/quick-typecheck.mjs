#!/usr/bin/env node
/**
 * PostToolUse hook for Write|Edit|MultiEdit
 * Runs a fast typecheck on the changed file. We use --noEmit and limit scope
 * to changed file's project so it stays under a second.
 *
 * If typecheck fails, we DON'T block — we just feed the error back to Claude
 * via additionalContext so it sees the error and can fix it on the next turn.
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { extname } from 'node:path';

let input;
try {
    input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
    process.exit(0);
}

const filePath = input?.tool_input?.file_path || '';

// Only typecheck TS files
if (!['.ts', '.tsx'].includes(extname(filePath))) {
    process.exit(0);
}

// Don't typecheck test files in this hook — slows things down. They get checked at Stop.
if (/\.test\.tsx?$/.test(filePath) || /\/tests\//.test(filePath)) {
    process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

try {
    execSync('npx tsc --noEmit --pretty false', {
        cwd: projectDir,
        encoding: 'utf8',
        stdio: 'pipe',
    });
    // Clean — exit silently
    process.exit(0);
} catch (err) {
    const errorOutput = (err.stdout || '') + (err.stderr || '');
    // Filter to errors that mention the changed file
    const lines = errorOutput.split('\n').filter(l =>
        l.includes(filePath.replace(projectDir + '/', '')) || l.startsWith('Found ')
    );

    if (lines.length === 0) {
        // Errors exist but not in this file — don't bother Claude
        process.exit(0);
    }

    console.log(JSON.stringify({
        hookSpecificOutput: {
            hookEventName: 'PostToolUse',
            additionalContext: `TypeScript errors after editing ${filePath}:\n${lines.join('\n')}\n\nFix these before claiming the task is done.`,
        }
    }));
    process.exit(0); // Don't block; just inform
}
