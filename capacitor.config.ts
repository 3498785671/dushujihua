import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 配置
 * 将前端打包为原生 Android APK
 *
 * 打包 APK 前，需先构建前端并指定后端地址：
 *   VITE_API_URL=https://你的后端域名 npm run build
 *   npx cap sync android
 *   cd android && ./gradlew assembleDebug
 */
const config: CapacitorConfig = {
  appId: 'com.dushu.plan',
  appName: '独属计划',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
