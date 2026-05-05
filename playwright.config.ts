import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src/__tests__/e2e/tests',
    fullyParallel: false,
    retries: 1,
    timeout: 30_000,
    expect: { timeout: 8_000 },

    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
    ],

    use: {
        baseURL: 'http://localhost:5173',
        screenshot: 'only-on-failure',
        video: 'off',
        trace: 'on-first-retry',
        locale: 'es-BO',
    },

    projects: [
        {
            name: 'chrome-local',
            use: { channel: 'chrome' },
        },
    ],
});