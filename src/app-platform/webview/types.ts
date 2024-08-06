import { IBridgeOptions } from '@/js-bridge/types';

export interface IWebViewBridgeOptions extends IBridgeOptions {
  success?: string; // 成功回调名称
  fail?: string; // 失败回调名称
}
