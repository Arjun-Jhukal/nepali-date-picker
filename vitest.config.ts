import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            thresholds: {
                'src/core/**': { lines: 95, functions: 95, branches: 95 },
                'src/picker/**': { lines: 85, functions: 85, branches: 85 },
            },
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
});
