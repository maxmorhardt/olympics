import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// No test suite yet; passWithNoTests keeps CI green and there are no thresholds.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
});
