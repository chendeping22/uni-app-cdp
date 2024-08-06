import { loginStore } from '@/store/modules/login';
import { setAppBadgeNum } from './push-jump';
import { hideLoading, log, showInfo } from './tools';

/**
 * 退出登录
 */
export const logout = (options: { showPrompt: boolean; prompt?: string }) => {
  hideLoading();
  const pages = getCurrentPages();
  const curPage = pages[pages.length - 1]?.route || '';

  if (curPage?.includes?.('app-platform/login')) {
    log('已在登录页，无须跳转。');
    setAppBadgeNum();
    return;
  }

  try {
    loginStore().clearAllData();
  } catch (err: any) {
    log('clearAllData_err : ', err);
  }
  setAppBadgeNum();

  // #ifdef MP-WEIXIN
  uni.reLaunch({
    url: '/app-platform/login/authorization-wx',
    success() {
      if (options.showPrompt) {
        showInfo(options.prompt ?? '请重新登录');
      }
    },
    fail() {
      log('wx-reLaunch到登录页异常');
    },
  });
  // // 测试公众号跳小程序
  // let redirectUrl =
  //   '/pages/welcome/welcome-wx?redirect=pages/notification/attendance-detail&areaId=1689192561068392450&locationId=347&signType=2&userType=1&pushTime=1708672202865&applicationId=-4&frequency=1';
  // uni.reLaunch({ url: redirectUrl });
  // #endif
  // #ifdef APP-PLUS || H5
  uni.reLaunch({
    url: '/app-platform/login/index',
    success() {
      if (options.showPrompt) {
        showInfo(options.prompt ?? '请重新登录');
      }
    },
    fail() {
      log('app-reLaunch到登录页异常');
    },
  });
  // #endif
};
