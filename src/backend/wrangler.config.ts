export default {
  build: {
    // Explicitly include "jose" in the bundle
    rollupOptions: {
      external: [],
    },
  },
}; 