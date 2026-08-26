import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Assets land in dist/assets/* with content hashes, which is what lets the
// deploy workflow cache them for a year and re-upload only index.html as
// short-lived. Build metadata is baked in from the CI environment so the
// Settings page can show exactly which commit is live.
export default defineConfig(() => ({
  plugins: [react()],
  define: {
    __BUILD_INFO__: JSON.stringify({
      commit: (process.env.GITHUB_SHA || 'local').slice(0, 7),
      ref: process.env.GITHUB_REF_NAME || 'local',
      runId: process.env.GITHUB_RUN_ID || null,
      builtAt: new Date().toISOString(),
    }),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}))
