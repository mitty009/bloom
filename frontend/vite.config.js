import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Set your desired output directory
    sourcemap: true, // Generate source maps for debugging
    // minify: 'terser', // Use Terser for minification (default)
    brotliSize: true, // Generate .br files alongside minified files
    rollupOptions: {
      // Add any custom Rollup options if needed
    },
  },
  server: {
    // Configure the development server if needed
  },
  optimizeDeps: {
    // Add options for optimizing dependencies
  },
});
