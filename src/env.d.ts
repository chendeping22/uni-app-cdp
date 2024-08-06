/// <reference types="vite/client" />

/** 应用内部版本号 */
declare const __INTERNAL_VERSION__: string;
/** 应用展示版本号 */
declare const __DISPLAY_VERSION__: string;

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
