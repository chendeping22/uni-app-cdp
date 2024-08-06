<template>
  <view class="content">
    <wechat-banner
      :is-guardian="false"
      :banner-current="bannerCurrent"
      class="banner"
      @bannerSwiperChange="bannerSwiperChange"
    >
    </wechat-banner>
    <button
      v-if="isOneKeyLoginChecked && !isUnionIdRegistered"
      class="custom-button"
      :open-type="agreementState ? 'getPhoneNumber' : ''"
      @click.stop="handleGetWxCode"
      @getphonenumber="loginByWx"
    >
      快捷登录
    </button>
    <view v-if="isUnionIdRegistered" class="custom-button" @click="oneKeyLogin">一键登录</view>
    <view class="login-tips">{{ wxLoginTips }}</view>
    <view class="custom-button other-login" @click="otherLoginAction">其他登录</view>
    <view class="protocol">
      <u-checkbox
        v-model="agreementState"
        shape="circle"
        size="48"
        icon-size="30"
        class="radio"
      ></u-checkbox>
      <view class="protocol-content" @click="agreementState = !agreementState">
        <text> 我已阅读并同意</text>
        <text class="color-primary" @tap.stop="goToPrivate">&nbsp;隐私政策&nbsp;</text>
        <text>和</text>
        <text
          class="color-primary"
          @tap.stop="linkToAgreement('/app-platform/login/user-agreement')"
          >&nbsp;用户协议&nbsp;</text
        >
      </view>
    </view>
    <UserTipAlert
      :type="showTipAlert"
      :need-get-w-x-phone="!isUnionIdRegistered"
      @click-cancel="clickCancelAction"
      @click-agree="clickAgreeAction"
      @click-handle-get-wx-code="clickHandleGetWxCode"
      @click-login-by-wx="clickLoginByWx"
    ></UserTipAlert>
  </view>
</template>

<script lang="ts">
import { loginStore, type IOrganizationList } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { omit } from '@/utils/lodash-es';
import { defaultFailText } from '@/utils/request';
import {
  getPageParams,
  hideLoading,
  log,
  setPageParams,
  setUrlStartWithSlash,
  showInfo,
  showLoading,
} from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { defineComponent, ref } from 'vue';
import { checkIsUnionIdRegistered, requestWxAuthLogin, wxOneKeyLogin } from '../services/login';
import { getAppClientId, getWxCode, goToPrivate } from '../utils/tools';
import wechatBanner from './components/wechat-banner.vue';
import { ClickLoginType, getLoginTips } from './utils/index';

import { wxMessage } from '@/pages/message/utils/msg-go';
import { getLinkParams, isFromShareLink } from '@/utils/handle-share-link';
import { msgPathReplace } from '@/utils/msg-path-replace';
import UserTipAlert from './components/user-tip-alert.vue';

export default defineComponent({
  components: {
    wechatBanner,
    UserTipAlert,
  },
  setup() {
    // store
    const store = loginStore();
    const bannerCurrent = ref(0);
    const isOneKeyLoginChecked = ref(false);
    const isUnionIdRegistered = ref(false);
    const unionId = ref('');
    const loginCode = ref('');
    const primaryColor = getPrimaryColor();

    const urlParams = ref<any>({});
    // 提示弹窗
    const showTipAlert = ref<ClickLoginType>(ClickLoginType.none);

    checkIsUnionIdRegistered()
      .then(res => {
        isUnionIdRegistered.value = res.isRegister;
        unionId.value = res.isRegister ? res.unionid : '';
      })
      .finally(() => {
        isOneKeyLoginChecked.value = true;
      });

    // banner滚动
    const bannerSwiperChange = (e: any) => {
      bannerCurrent.value = e.detail.current;
    };

    // 获取wxCode
    const handleGetWxCode = async () => {
      if (!agreementState.value) {
        showTipAlert.value = ClickLoginType.WechatMiniProgram;
        return;
      }
      loginCode.value = '';
      const code = await getWxCode();
      loginCode.value = code;
    };

    // 微信登录
    const loginByWx = async (e: {
      detail: {
        errMsg: string;
        code: string;
      };
    }) => {
      const { detail } = e || {};
      const { errMsg, code: phoneCredentialsCode } = detail || {};
      if (errMsg !== 'getPhoneNumber:ok') return;
      if (!loginCode.value) return;
      if (!agreementState.value) {
        showTipAlert.value = ClickLoginType.WechatMiniProgram;
        return;
      }
      try {
        showLoading();

        const [clientId] = await getAppClientId();
        const authRes = await requestWxAuthLogin(
          appId,
          loginCode.value,
          phoneCredentialsCode,
          clientId,
        );
        await selectIdentity(authRes);
      } catch (e) {
        hideLoading();
        showInfo(defaultFailText(e));
      }
    };

    // 选择组织
    const selectIdentity = async (organizationList: IOrganizationList) => {
      console.log('authRes', organizationList);

      const { updateOrganizationList } = store;
      updateOrganizationList(organizationList as IOrganizationList);
      await changeIdentityNormal(organizationList);
      hideLoading();
    };

    const changeIdentityNormal = async (organizationList: IOrganizationList) => {
      const params = getLinkParams();
      if (
        organizationList.locations.length == 1 &&
        organizationList.locations[0].locations.length == 1
      ) {
        const identity = await store.changeIdentity(
          organizationList.locations[0].userType,
          organizationList.locations[0].locations[0],
        );
        console.log('切换成功', identity);
        checkMsg();
      } else {
        const params = getLinkParams();
        log('urlParams: ', urlParams.value);
        let switchIdentifyUrl = `/app-platform/login/switch-identity${params}`;
        if (urlParams.value?.redirect) {
          if (params && params.indexOf('?') !== -1) {
            switchIdentifyUrl += `&${setPageParams(urlParams.value)}`;
          } else {
            switchIdentifyUrl += `?${setPageParams(urlParams.value)}`;
          }
        }
        log('switchIdentifyUrl: ', switchIdentifyUrl);
        uni.navigateTo({
          url: switchIdentifyUrl,
        });
      }
    };

    const checkMsg = async () => {
      // 有重定向地址，优先跳转
      let redirectUrl = '';

      if (urlParams.value?.redirect) {
        redirectUrl = setUrlStartWithSlash(
          `${urlParams.value.redirect}${setPageParams(omit(urlParams.value, 'redirect'), '?')}`,
        );
      }
      console.log('wx-login-redirectUrl-org: ' + urlParams.value?.redirect);
      console.log('wx-login-redirectUrl-slash: ' + redirectUrl);
      // 兼容旧消息
      redirectUrl = msgPathReplace(redirectUrl, urlParams);
      console.log('wx-login-redirectUrl-new: ' + redirectUrl);
      const params = getPageParams();
      const redirect = params?.redirect ? decodeURIComponent(params?.redirect) : '';
      console.log('wx-login-redirect: ' + redirect);
      if (redirect && !redirect.includes('/app-platform/login/authorization-wx')) {
        console.log('urlParams.value: ' + JSON.stringify(urlParams.value));
        const locationId = urlParams.value['locationId'];
        let userType = urlParams.value['userType'];
        const userId = urlParams.value['userId'];
        console.log(
          'locationId: ' + locationId + ', userType: ' + userType + ', userId = ' + userId,
        );
        console.log('userId: ' + userId + ', current userId: ' + store.userInfo?.userId);
        // 先用userId判断当前用户身份，如果userId是空的就是非法
        if (!userId) {
          hideLoading();
          goWorkbench();
          setTimeout(() => {
            showInfo('该消息不符合条件');
          }, 500);
          return;
        }

        wxMessage(
          userId,
          userType,
          locationId,
          redirectUrl,
          () => {
            goWorkbench();
          },
          () => {
            goWorkbench();
          },
        );
      } else {
        goWorkbench();
      }
    };

    const goWorkbench = () => {
      const params = getLinkParams();
      uni.reLaunch({
        url: `/pages/workbench/index${params}`,
        success: () => {},
        fail: (err: any) => {
          console.log('登陆失败: ', err);
          showInfo('登陆失败');
          uni.hideLoading();
        },
      });
    };

    const { miniProgram } = uni?.getAccountInfoSync();
    const appId = miniProgram.appId;
    /** 微信一键登录 (unionId) */
    const oneKeyLogin = async () => {
      if (!agreementState.value) {
        showTipAlert.value = ClickLoginType.WechatMiniProgram;
        return;
      }
      try {
        showLoading();
        const [clientId] = await getAppClientId();
        const authRes: any = await wxOneKeyLogin(appId, unionId.value, clientId);
        const { needToSwitch } = authRes;
        if (needToSwitch) {
          hideLoading();
          isUnionIdRegistered.value = false;
          uni.showToast({
            title: '一键登录失败请使用快捷登录',
            icon: 'none',
            mask: true,
            duration: 2000,
          });
          return;
        }
        await selectIdentity(authRes);
      } catch (e) {
        hideLoading();
        showInfo(defaultFailText(e));
      }
    };

    const wxLoginTips = getLoginTips();

    // 协议是否同意 true 同意
    const agreementState = ref(false);
    // 其他登陆
    const otherLoginAction = () => {
      let url = '/app-platform/login/index';
      if (urlParams.value?.redirect) {
        url += `?${setPageParams(urlParams.value)}`;
      } else if (isFromShareLink(urlParams.value)) {
        const params = getLinkParams();
        url += params;
      }
      uni.navigateTo({
        url: url,
        success: () => {},
        fail: err => {
          console.log(err);
        },
      });
    };
    // 用户协议及隐私协议跳转
    const linkToAgreement = (url: string) => {
      uni.navigateTo({
        url,
      });
    };

    onLoad(options => {
      console.log('authorization-wx onLoad options: ' + JSON.stringify(options));
      urlParams.value = options;
    });

    const clickCancelAction = () => {
      showTipAlert.value = ClickLoginType.none;
    };

    const clickAgreeAction = (type: ClickLoginType) => {
      agreementState.value = true;
      showTipAlert.value = ClickLoginType.none;
      oneKeyLogin();
    };

    const clickHandleGetWxCode = () => {
      agreementState.value = true;
      showTipAlert.value = ClickLoginType.none;
      handleGetWxCode();
    };

    const clickLoginByWx = e => {
      agreementState.value = true;
      loginByWx(e);
      showTipAlert.value = ClickLoginType.none;
    };
    return {
      primaryColor,
      bannerCurrent,
      bannerSwiperChange,
      isOneKeyLoginChecked,
      isUnionIdRegistered,
      wxLoginTips,
      agreementState,
      otherLoginAction,
      loginByWx,
      linkToAgreement,
      oneKeyLogin,
      handleGetWxCode,
      goToPrivate,
      showTipAlert,
      clickCancelAction,
      clickHandleGetWxCode,
      clickLoginByWx,
      clickAgreeAction,
    };
  },
});
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .banner {
    margin-top: 88rpx;
  }
  .custom-button {
    margin: 0 48rpx;
    height: 104rpx;
    color: white;
    font-size: 34rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    border-radius: 16rpx;
    background: $ui-color-primary;
  }

  .other-login {
    margin-top: 48rpx;
    background-color: white;
    border: 1px solid gray;
    color: black;
  }

  .login-tips {
    margin: 10rpx 30rpx 0;
    font-family: PingFangSC-Regular;
    font-size: 30rpx;
    color: #4e5969;
    text-align: center;
    line-height: 48rpx;
    font-weight: 400;
  }

  .protocol {
    color: #00000073;
    font-size: 26rpx;
    margin: 48rpx 48rpx;
    display: flex;

    .radio {
      transform: scale(0.8);
      width: 48rpx;
      height: 48rpx;
    }
    .protocol-content {
      padding-left: 24rpx;
      flex: 1;
      min-height: 38.4rpx;
      margin: auto;
    }
  }
  .color-primary {
    color: $ui-color-primary;
  }
}

:deep(.u-checkbox__label) {
  margin-left: 0rpx !important;
  margin-right: 0rpx !important;
}
</style>
