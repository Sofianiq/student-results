import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  // مسار نسبي حتى يعمل التطبيق على GitHub Pages أو أي استضافة ثابتة
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'بوابة الطالب — كلية التقنيات الصحية والطبية',
        short_name: 'بوابة الطالب',
        description: 'السعي الفصلي ونتائج الامتحانات — جامعة السراج الأهلية',
        lang: 'ar',
        dir: 'rtl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#14284b',
        background_color: '#f6f3ec',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: 'index.html',
        // بيانات الطالب لا تُخزَّن في ذاكرة المتصفح الشبكية؛ التطبيق يحتفظ بآخر نسخة بنفسه
        navigateFallbackDenylist: [/^\/rest\//],
      },
    }),
  ],
  build: {
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
