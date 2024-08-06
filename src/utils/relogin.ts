import { loginStore } from '@/store/modules/login';
import { logout } from './logout';
import { hideLoading, showInfo } from './tools';

export const reLogin = async (options: {
  onReLoginSuccess?: () => void;
  onReLoginError?: () => void;
}) => {
  const store = loginStore();
  const onSuccess = () => {
    const pages = getCurrentPages();
    const curPage = pages[pages.length - 1]?.route || '';

    if (options?.onReLoginSuccess && typeof options.onReLoginSuccess === 'function') {
      options.onReLoginSuccess();
    } else if (!curPage?.includes?.('workbench/index')) {
      uni.reLaunch({
        url: '/pages/workbench/index',
        success: () => {
          hideLoading();
          showInfo('页面过期或账号信息发生变化');
        },
      });
    } else {
      uni.$emit('workbenchRefreshData');
    }
  };

  if (store.authInfo?.refreshToken) {
    try {
      await store.refreshToken();
      onSuccess();
    } catch (ex) {
      console.debug('===> reLogin refreshToken error', ex);
      if (options?.onReLoginError && typeof options.onReLoginError === 'function') {
        options.onReLoginError();
      }
      logout({ showPrompt: true });
    }
  } else {
    if (options?.onReLoginError && typeof options.onReLoginError === 'function') {
      options.onReLoginError();
    }
    logout({ showPrompt: true });
  }
};
