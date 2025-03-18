const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure the static/js directory exists
const staticJsDir = path.join(__dirname, 'static', 'js');
if (!fs.existsSync(staticJsDir)) {
  fs.mkdirSync(staticJsDir, { recursive: true });
}

// Build the bundle
esbuild.build({
  entryPoints: ['src/form.js'],
  bundle: true,
  outfile: 'static/js/form.js',
  format: 'iife', // Immediately Invoked Function Expression
  minify: true,
  sourcemap: true,
  target: ['es2015'], // Target older browsers for compatibility
}).then(() => {
  console.log('✅ Build completed successfully!');
  console.log('📦 Bundle saved to static/js/form.js');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});