import type { Action, Service } from './enums';

export interface IBridgeOptions {
  service: Service; // 模块
  action: Action; // 功能
  data?: any; // 入参
  timeout?: number; // 超时时间 单位是ms
}

export interface IBridgeResponse {
  code: number;
  msg?: string;
  data?: any;
}
export type TResolveCallback = (data: IBridgeResponse['data']) => void;
export type TRejectCallback = (response: IBridgeResponse) => void;
export type TBusinessFunction = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => void;
export type TServices = Record<string, Record<string, TBusinessFunction>>;

export enum ScreenOrientationAction {
  LOCK_LANDSCAPE_PRIMARY = '1',
  LOCK_PORTRAIT_PRIMARY = '2',
}
