import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
})
