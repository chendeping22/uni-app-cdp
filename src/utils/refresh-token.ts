import { loginStore } from '@/store/modules/login';
import { isNil } from '@/utils/lodash-es';
import { refreshTokenApi, refreshToken as refreshTokenService } from '../services/user';
import { getAppInfo } from './cache-app';
import { clientId_key, tokenTime_key } from './storage-keys';

let isFetching = false;

export const refreshToken = async () => {
  if (!isFetching) {
    const store = loginStore();
    if (store.authInfo?.accessToken && store.authInfo?.refreshToken) {
      isFetching = true;
      return refreshTokenService(store.authInfo.accessToken, store.authInfo.refreshToken).finally(
        () => {
          isFetching = false;
        },
      );
    }
  }
  return Promise.reject();
};

export const refreshTokenByClientId = async () => {
  if (isFetching) {
    return;
  }
  const store = loginStore();
  const clientId = uni.getStorageSync(clientId_key);
  if (!isNil(clientId) && !isNil(store.authInfo?.accessToken)) {
    const tokenTime = uni.getStorageSync(tokenTime_key);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (tokenTime > 0 && currentTimestamp - tokenTime > 1 * 60 * 60) {
      uni.setStorageSync(tokenTime_key, currentTimestamp);
      try {
        isFetching = true;
        await refreshTokenApi(
          clientId,
          store.authInfo?.accessToken,
          store.currentOrganization?.id ?? '',
          store.userInfo?.id ?? '0',
          store.currentUserType,
        );
        isFetching = false;
      } catch (e) {
        isFetching = false;
        uni.setStorageSync(tokenTime_key, tokenTime);
      }
    }
  }
};

/** 是否登录过 **/
export const haveLogin = () => {
  const appInfo = getAppInfo();
  const haveToken = !isNil(appInfo.authInfo.accessToken);
  const clientId = uni.getStorageSync(clientId_key);

  return haveToken && !isNil(clientId);
};
