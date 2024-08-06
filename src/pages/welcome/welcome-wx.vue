<template>
  <view>
    <u-image
      :src="start"
      :show-loading="false"
      :fade="false"
      :width="width + 'px'"
      :height="height + 'px'"
      mode="aspectFill"
    ></u-image>
  </view>
  <!-- <view class="center">
    <u-loading mode="flower" :size="100"></u-loading>
  </view> -->
</template>

<script setup lang="ts">
import { wxMessage } from '@/pages/message/utils/msg-go';
import start from '@/static/welcome/start.jpg';
import { loginStore } from '@/store/modules/login';
import { omit } from '@/utils/lodash-es';
import { hasNetwork, log, setPageParams, setUrlStartWithSlash, showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { onBeforeMount, ref } from 'vue';

import { getLinkParams, handleShareLink, isFromShareLink } from '@/utils/handle-share-link';
import { msgPathReplace } from '@/utils/msg-path-replace';

const params = ref<any>({});

const info = uni.getSystemInfoSync();
const width = info.screenWidth;
const height = info.screenHeight;

const makeRedirectUrl = () => {
  if (params.value && params.value.redirect) {
    const otherParams = omit(params.value, 'redirect');
    const redirect = params.value.redirect;
    const redirectParams: string[] = [];
    Object.entries(otherParams).forEach(([key, value]) => {
      const p = `${key}=${value}`;
      if (redirect.indexOf(p) === -1) {
        redirectParams.push(p);
      }
    });
    if (redirectParams.length) {
      return `${redirect}${/\?/.test(redirect) ? '&' : '?'}${redirectParams.join('&')}`;
    }
    return redirect;
  }
  return '';
};

/** 转到登录页 */
const toLoginPage = (loginPageSimple?: boolean) => {
  let url = '/app-platform/login/authorization-wx';
  if (!loginPageSimple && params.value?.redirect) {
    const otherParams = omit(params.value, 'redirect');
    url += `?${setPageParams(otherParams)}&redirect=${makeRedirectUrl()}`;
  } else if (isFromShareLink(params.value)) {
    const params = getLinkParams();
    url += params;
  }
  log('toLoginPage_url: ', url);
  loginStore().clearAllData();
  uni.reLaunch({
    url,
  });
};

const refreshLogin = async () => {
  let url = '/app-platform/login/authorization-wx';
  try {
    const res = await loginStore().verifyLogin();
    log('refreshLogin -> result', res);
    url = '/pages/workbench/index';
  } catch (error) {
    log('refreshLogin -> err', error);
    // clientId is null
    toLoginPage();
    return;
  }
  log('refreshLogin ---> params.value ', params?.value);
  let redirectUrl = url;
  // 如果有重定向路由，先处理重定向（微信公众号推送）
  // const regExp = /^(http|https):\/\/.*/ regExp.test(params.value.redirect)
  if (params.value?.redirect) {
    log('from redirect');
    redirectUrl = setUrlStartWithSlash(makeRedirectUrl());
    log('wx-weicome-redirectUrl-org: ', params.value?.redirect);
    log('welcome-wx refreshLogin check redirect: ', redirectUrl);
    redirectUrl = msgPathReplace(redirectUrl, params);
    log('wx-welcome-redirectUrl-new: ', redirectUrl);
    const store = loginStore();
    log('params.value: ', params.value);
    const locationId = params.value['locationId'];
    let userType = params.value['userType'];
    const userId = params.value['userId'];
    log('locationId: ' + locationId + ', userType: ' + userType + ', userId = ' + userId);
    log('userId: ' + userId + ', current userId: ' + store.userInfo?.userId);
    // 先用userId判断当前用户身份，如果userId是空的就是非法
    if (!userId) {
      log('该消息不符合条件');
      toLoginPage();
      setTimeout(() => {
        showInfo('该消息不符合条件');
      }, 500);
      return;
    }

    log('msg_locationId: ' + locationId + ', current_locationId: ' + store.currentOrganization?.id);
    log('msg_userType: ' + userType + ', current_userType: ' + store.currentUserType);

    wxMessage(
      userId,
      userType,
      locationId,
      redirectUrl,
      () => {
        toLoginPage();
      },
      () => {
        // 消息与当前账号不符，直接去首页
        uni.reLaunch({
          url: '/pages/workbench/index',
          fail: (err: any) => {
            // 跳转失败就回到默认首页
            log('welcome-wx refreshLogin err: ', err);
            toLoginPage();
          },
        });
      },
    );

    return;
  } else if (isFromShareLink(params.value)) {
    log('from share link');
    handleShareLink(true, success => {
      const params = getLinkParams();
      log('from share link params: ', params);
      uni.reLaunch({
        url: `/pages/workbench/index${params}`,
        fail: (err: any) => {
          toLoginPage();
        },
      });
    });
    return;
  }

  log('welcome-wx refreshLogin redirectUrl: ', redirectUrl);

  uni.reLaunch({
    url: redirectUrl,
    fail: (err: any) => {
      // 跳转失败就回到默认首页
      log('welcome-wx refreshLogin err: ', err);
      toLoginPage();
    },
  });
};

onBeforeMount(async () => {
  if (!(await hasNetwork())) {
    showInfo('当前无网络');
    toLoginPage();
    return;
  }
  // #ifdef H5
  // h5没有checkSession方法, 首次进入时不论是否已登录, 都转到登录
  toLoginPage();
  // #endif

  // #ifdef MP-WEIXIN
  uni.checkSession({
    success: () => {
      refreshLogin();
    },
    fail: () => {
      console.info('session失效, 重新登录');
      toLoginPage();
    },
  });
  // #endif
});

onLoad(options => {
  log('welcome-wx onLoad options: ', options);
  // NOTE: 脏数据兼容处理，redirect参数存在无encode的情况，造成参数异常
  if (options && options.redirect && /\?[^=]*$/.test(options.redirect)) {
    options.redirect = options.redirect.replace(/\?[^=]*$/, '');
  }
  params.value = options;
});
</script>

<style>
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
