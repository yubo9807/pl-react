import { defineConfig } from 'vite';
import baseConfig from './vite.base';
import removeFuncs from './plugins/remove-func';
import noOutput from './plugins/no-output';

const config = defineConfig({
  plugins: [
    noOutput((path) => !/.(ts|tsx)$/.test(path)),  // 服务端只用到 js 文件
    removeFuncs('useLayoutEffect'),  // 一些不可能触发的钩子
  ],
  build: {
    copyPublicDir: false,
    emptyOutDir: false,
    minify: true,
    ssr: 'test/server.ts',
    rollupOptions: {
      output: {
        format: 'cjs',
      }
    }
  },
})

export default Object.assign(config, baseConfig);
