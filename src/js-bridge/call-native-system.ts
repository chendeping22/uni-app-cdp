import { shareMiniProgramToWXSceneSession } from '@/utils/share';
import {
  ScreenOrientationAction,
  type IBridgeOptions,
  type TRejectCallback,
  type TResolveCallback,
} from './types';

const scanCode = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  uni.scanCode({
    ...{ scanType: ['qrCode'], ...options.data },
    success: (res: any) => {
      resolve(res);
    },
    fail: (err: any) => {
      reject({ code: 400, msg: err });
    },
  });
};

const share = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  shareMiniProgramToWXSceneSession(options.data, resolve, reject);
};

/**
 * 处理操作app的屏幕旋转
 */
export const screenOrientation = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const { action, handleFull } = options.data || {};
  try {
    if (action === ScreenOrientationAction.LOCK_LANDSCAPE_PRIMARY) {
      plus.screen.lockOrientation('landscape-primary');
      !handleFull && plus.navigator.setFullscreen(true);
    } else if (action === ScreenOrientationAction.LOCK_PORTRAIT_PRIMARY) {
      plus.screen.lockOrientation('portrait-primary');
      !handleFull && plus.navigator.setFullscreen(false);
    }

    resolve({});
  } catch (error) {
    plus.navigator.setFullscreen(false);
    reject({ code: 400, msg: '设置屏幕旋转失败' });
  }
};

export default {
  scanCode,
  share,
  screenOrientation,
};
