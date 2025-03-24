export default {
  build: {
    // Explicitly include "jose" in the bundle
    rollupOptions: {
      external: [],
    },
  },
  // Ensure proper module resolution
  resolve: {
    alias: {
      jose: 'jose'
    }
  }
}; 