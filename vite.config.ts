import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'UniversalChatPopup',
      fileName: (format) => `just-chat.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {
          // Add any external dependencies here if needed
        }
      }
    }
  }
});