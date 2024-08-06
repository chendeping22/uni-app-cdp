import uni from '@dcloudio/vite-plugin-uni';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import { internalVersion, version } from './package.json';
import UniComponentPlaceholder from './vite-plugins/vite-uni-component-placeholder';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  const isDev = process.argv.slice(2).includes('dev');
  const isWeixin = process.env.UNI_PLATFORM === 'mp-weixin';

  const build = !isWeixin
    ? {
        build: {
          target: ['es2015', 'chrome64', 'safari11'],
          assetsDir: 'static',
        },
      }
    : {
        build: {
          target: 'es2015',
          assetsDir: 'static',
        },
      };
  return {
    plugins: [
      uni(),
      UniComponentPlaceholder(),
      copy({
        targets: [isDev && { src: 'unpackage', dest: 'dist/dev/app' }].filter(Boolean),
      }),
    ],
    ...build,
    define: {
      __DISPLAY_VERSION__: `'${version}'`,
      __INTERNAL_VERSION__: `'${internalVersion}'`,
    },
    envDir: './env',
  };
});
