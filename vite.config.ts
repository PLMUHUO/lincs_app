import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // 添加legacy插件，解决GitHub Pages的MIME类型问题
    legacy({
      targets: ['defaults'],
      // 生成传统脚本，避免ES模块MIME类型问题
      modernPolyfills: false
    })
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/lincs_app/' // 根据GitHub仓库名称配置
})
