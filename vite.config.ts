import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/lincs_app/', // 根据GitHub仓库名称配置
  // 禁用ES模块，使用传统脚本
  build: {
    // 确保构建输出的文件具有正确的扩展名和MIME类型
    rollupOptions: {
      output: {
        // 使用IIFE格式，避免ES模块的MIME类型问题
        format: 'iife',
        // 提供全局变量名
        name: 'LincsApp',
        // 确保所有模块都被打包到一个文件中
        manualChunks: undefined
      }
    }
  }
})
