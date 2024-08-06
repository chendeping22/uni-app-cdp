<template>
  <page>
    <u-navbar
      :title="isWeChat ? '登录' : ''"
      :is-back="isWeChat"
      title-color="black"
      :title-bold="true"
      back-icon-color="black"
      :background="{ background: '#00000000' }"
      :border-bottom="false"
    ></u-navbar>
    <view class="logo" :style="{ marginTop: marginTop + 'rpx' }">
      <u-image
        :src="icon_follow"
        width="128"
        height="128"
        :show-loading="false"
        :fade="false"
      ></u-image>
    </view>
    <view class="tabs">
      <u-tabs
        v-model="actionIndex"
        bg-color="#00000000"
        :list="tabsTitle"
        :is-scroll="false"
        font-size="34"
        :active-color="primaryColor"
        @change="handleChangeTab"
      ></u-tabs>
    </view>
    <view v-if="actionIndex == 0" class="input-content">
      <!--帐号登录-->
      <login-input
        v-model:val="accountValue"
        placeholder="账号"
        :maxlength="20"
        class="input-margin"
        @update="accountValue = $event"
        @clickIcon="accountValue = ''"
      ></login-input>
      <login-input
        v-model:val="passwordValue"
        placeholder="密码"
        :maxlength="20"
        type="password"
        :src="pwdIconSrc"
        :show-password="showPassword"
        :force-show-clear-icon="true"
        class="input-margin"
        @update="passwordValue = $event"
        @clickIcon="showPassword = !showPassword"
      ></login-input>
      <view
        :class="['custom-button', accountLoginDisableState ? 'color-primary-disable' : '']"
        @click="accountLoginAction"
        >登录</view
      >
    </view>
    <view v-else class="input-content">
      <!--短信登录-->
      <login-input
        v-model:val="phoneValue"
        placeholder="手机号"
        type="number"
        :maxlength="11"
        class="input-margin"
        @update="phoneValue = $event"
        @clickIcon="phoneValue = ''"
      ></login-input>
      <verify-input
        class="input-margin"
        :phone-value="phoneValue"
        :code-value="codeValue"
        @update="codeValue = $event"
      >
      </verify-input>
      <view
        :class="['custom-button', phoneLoginDisableState ? 'color-primary-disable' : '']"
        @click="phoneLoginAction"
        >登录
      </view>
    </view>
    <view class="forget-pwd"><text @click="forgetPwdAction">忘记密码？</text></view>
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
    <!--#ifdef APP-PLUS-->
    <view class="bottom" :style="{ marginBottom: !isHaveSafeBottom ? 16 + 'rpx' : 0 + 'rpx' }">
      <ThirdPartyLogin @click-function="clickThirdPartLoginAction"></ThirdPartyLogin>
    </view>
    <set-server-url></set-server-url>
    <!--#endif-->
    <UserTipAlert
      :type="showTipAlert"
      @click-agree="clickAgreeAction"
      @click-cancel="clickCancelAction"
    ></UserTipAlert>
  </page>
</template>

<script lang="ts">
import iconLookPwd from '@/app-platform/static/login/icon_look_pwd.svg';
import iconNoLookPwd from '@/app-platform/static/login/icon_no_look_pwd.svg';
import useGlobalConfig from '@/hooks/use-global-config';
import { callBridge } from '@/js-bridge/call-bridge';
import { callNative } from '@/js-bridge/call-native';
import { Action, Service } from '@/js-bridge/enums';
import { wxMessage } from '@/pages/message/utils/msg-go';
import { loginStore, type IOrganizationList } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { EnvType } from '@/utils/env';
import { getLinkParams } from '@/utils/handle-share-link';
import { isNil, omit } from '@/utils/lodash-es';
import { msgPathReplace } from '@/utils/msg-path-replace';
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
import track from '@/utils/track';
import { onLoad, onShow } from '@dcloudio/uni-app';
import SparkMD5 from 'spark-md5';
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
} from 'vue';
import {
  accountLogin,
  isBindMobile,
  operatorLogin,
  thirdLogin,
  verificationCode,
} from '../services/login';
import { RSAEncrypt } from '../utils/encrypt';
import { getAppClientId, goToPrivate } from '../utils/tools';
import loginInput from './components/login-input.vue';
import setServerUrl from './components/set-server-url.vue';
import ThirdPartyLogin from './components/third-party-login.vue';
import UserTipAlert from './components/user-tip-alert.vue';
import verifyInput from './components/verify-input.vue';
import { ClickLoginType, PlatformType } from './utils/index';
import icon_follow from '/static/icon_follow.svg';

export default defineComponent({
  components: { loginInput, verifyInput, setServerUrl, ThirdPartyLogin, UserTipAlert },
  setup() {
    // store
    const store = loginStore();
    const globalConfig = useGlobalConfig();
    // tabs
    const tabsTitle = computed(() => {
      if (globalConfig.remote.value.disableSMS) {
        return [{ name: '账号登录' }];
      }
      return [{ name: '账号登录' }, { name: '短信登录' }];
    });
    // 账号登录按钮的禁用状态 true 禁用
    const accountLoginDisableState = ref(true);
    // 手机登录按钮的禁用状态 true 禁用
    const phoneLoginDisableState = ref(true);
    // 选中tab
    const actionIndex = ref(0);
    // 账号的值
    const accountValue = ref('');
    // 密码的值
    const passwordValue = ref('');
    // 是否显示密码
    const showPassword = ref(true);
    // 密码图标
    const pwdIconSrc = ref(iconNoLookPwd);
    // 手机号的值
    const phoneValue = ref('');
    // 验证码的值
    const codeValue = ref('');
    // 手机号的验证状态
    const phoneVerifyState = ref(false);
    // 协议是否同意
    const agreementState = ref<boolean>(false);
    // 获取主题色
    const primaryColor = getPrimaryColor();
    // 提示弹窗
    const showTipAlert = ref<ClickLoginType>(0);

    const isApp = ref<boolean>(false);
    const isWeChat = ref<boolean>(false);
    const isHaveSafeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom > 0;

    // #ifdef APP-PLUS
    isApp.value = true;
    // #endif
    // #ifdef MP-WEIXIN
    isWeChat.value = true;
    // #endif
    let marginTop = 112;
    if (isApp.value) {
      // 屏幕高度
      const screenHeight = uni.getSystemInfoSync().screenHeight ?? 0;
      const screenWidth = uni.getSystemInfoSync().screenWidth ?? 0;

      if (screenHeight > 0 && screenWidth > 0 && screenWidth <= 750) {
        const height = Number((screenHeight * 375) / screenWidth);

        const isMinScreen: boolean = height < 667;
        const isSmallScreen: boolean = height <= 700;
        if (isMinScreen) {
          marginTop = -10;
        } else if (isSmallScreen) {
          marginTop = 32;
        }
      }
      log('screenHeight=', screenHeight, marginTop, isApp.value);
    }

    const urlParams = ref<any>({});

    // #ifdef MP-WEIXIN
    uni.setNavigationBarTitle({
      title: '登录',
    });
    // #endif

    onBeforeMount(() => {
      uni.$on('clearPwd', clearPwdData);
    });
    onBeforeUnmount(() => {
      uni.$off('clearPwd', clearPwdData);
    });
    onShow(() => {
      // #ifdef APP-PLUS
      plus.screen.lockOrientation('portrait-primary');
      // #endif
    });

    // tab切换
    const handleChangeTab = (idx: number) => {
      actionIndex.value = idx;
    };

    // 账号登陆
    const accountLoginAction = async () => {
      if (accountLoginDisableState.value) {
        return;
      }

      if (!agreementState.value) {
        showTipAlert.value = ClickLoginType.account;
        return;
      }

      try {
        showLoading();
        const [clientId] = await getAppClientId();
        const organizationList = (await accountLogin(
          accountValue.value,
          SparkMD5.hash(passwordValue.value),
          clientId,
        )) as IOrganizationList;
        track('login', { md: 'account' });
        if (organizationList.isDefaultPwd) {
          store.clearAllData();
          hideLoading();
          const account = encodeURIComponent(accountValue.value);
          const isBindMobile = encodeURIComponent(organizationList.isBindMobile);
          const phoneNumber = encodeURIComponent(organizationList.phoneNumber);
          uni.navigateTo({
            url: `/app-platform/login/default-password?account=${account}&isBindMobile=${isBindMobile}&phoneNumber=${phoneNumber}`,
          });
        } else if (!organizationList.isBindMobile) {
          store.clearAllData();
          hideLoading();
          const account = encodeURIComponent(accountValue.value);
          const password = encodeURIComponent(passwordValue.value);
          uni.navigateTo({
            url: `/app-platform/login/bind-mobile?account=${account}&password=${password}`,
          });
        } else {
          await selectIdentity(organizationList);
        }
      } catch (error: any) {
        hideLoading();
        showInfo(defaultFailText(error));
      }
    };

    // 手机号登陆
    const phoneLoginAction = async () => {
      if (phoneLoginDisableState.value) {
        return;
      }

      const params = {
        phone: phoneValue.value,
        verify: codeValue.value,
      };
      if (!agreementState.value) {
        showTipAlert.value = ClickLoginType.mobile;
        return;
      }
      if (!(await verifyLoginByPhone(params))) {
        return;
      }
      showLoading();
      try {
        const [clientId] = await getAppClientId();
        const organizationList = await verificationCode(
          RSAEncrypt(params.phone) || '',
          params.verify,
          clientId,
        );
        track('login', { md: 'sms' });
        await selectIdentity(organizationList as IOrganizationList);
      } catch (error: any) {
        hideLoading();
        showInfo(defaultFailText(error));
      }
    };

    // 选择组织
    const selectIdentity = async (organizationList: IOrganizationList) => {
      const { updateOrganizationList } = store;
      updateOrganizationList(organizationList as IOrganizationList);
      await changeIdentityNormal(organizationList);
      hideLoading();
    };

    const changeIdentityNormal = async (organizationList: IOrganizationList) => {
      if (
        organizationList.locations.length == 1 &&
        organizationList.locations[0].locations.length == 1 &&
        (isNil(organizationList.locations[0].locations[0].children) ||
          organizationList.locations[0].locations[0].children?.length < 1)
      ) {
        const identity = await store.changeIdentity(
          organizationList.locations[0].userType,
          organizationList.locations[0].locations[0],
        );
        console.log('单组织切换成功', identity);
        checkMsg();
      } else {
        const params = getLinkParams();
        log('urlParams : ', urlParams.value);
        let switchIdentifyUrl = `/app-platform/login/switch-identity${params}`;
        if (urlParams.value?.redirect) {
          if (params && params.indexOf('?') !== -1) {
            switchIdentifyUrl += `&${setPageParams(urlParams.value)}`;
          } else {
            switchIdentifyUrl += `?${setPageParams(urlParams.value)}`;
          }
        }
        log('switchIdentifyUrl : ', switchIdentifyUrl);
        uni.navigateTo({
          url: switchIdentifyUrl,
        });
      }
    };

    const goWorkbench = () => {
      const params = getLinkParams();
      uni.reLaunch({
        url: `/pages/workbench/index${params}`,
        success: () => {},
        fail: (err: any) => {
          log('登陆失败 : ', err);
          showInfo('登陆失败');
          uni.hideLoading();
        },
      });
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
        console.log('urlParams.value : ' + JSON.stringify(urlParams.value));
        const locationId = urlParams.value['locationId'];
        let userType = urlParams.value['userType'];
        const userId = urlParams.value['userId'];
        console.log(
          'locationId : ' + locationId + ', userType : ' + userType + ', userId = ' + userId,
        );
        console.log('userId : ' + userId + ', current userId : ' + store.userInfo?.userId);
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

    /** 手机登录时，验证数据 */
    const verifyLoginByPhone = async (params: any) => {
      if (!codeValue.value) {
        return false;
      }
      if (!params.verify) {
        uni.showToast({ title: '请填写验证码', icon: 'none', mask: true, duration: 1000 });
        return false;
      }

      return true;
    };

    // 忘记密码
    const forgetPwdAction = () => {
      uni.navigateTo({
        url: '/app-platform/login/forget-password',
        success: () => {},
        fail: (err: any) => {
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

    const clickThirdPartLoginAction = (type: PlatformType) => {
      if (!agreementState.value) {
        const clickType =
          type === PlatformType.WeChat
            ? ClickLoginType.weChat
            : type === PlatformType.DingTalk
            ? ClickLoginType.dingTalk
            : type === PlatformType.Apple
            ? ClickLoginType.apple
            : ClickLoginType.phone;
        showTipAlert.value = clickType;
        return;
      }

      if (type === PlatformType.Phone) {
        // 考虑到会有多次回调，不使用统一的入口callBridge
        callPhoneBridge();
      } else {
        callAuthBridge(type);
      }
    };

    const callPhoneBridge = () => {
      callNative(
        {
          service: Service.auth,
          action: Action.presentOneKeyLoginView,
        },
        (res: any) => {
          log(Action.presentOneKeyLoginView, 'response:', res);
          if (res.code && res.code.length > 0) {
            verifyMobileAndLoginAction(PlatformType.Phone, res.code);
          }
        },
        err => {
          log(Action.presentOneKeyLoginView, 'err:', err);
          showInfo(defaultFailText({ ...err, desc: err.msg }));
        },
      );
    };

    const callAuthBridge = (type: PlatformType) => {
      callBridge({
        service: Service.auth,
        action:
          type === PlatformType.Phone
            ? Action.presentOneKeyLoginView
            : type === PlatformType.Apple
            ? Action.appleAuth
            : type === PlatformType.DingTalk
            ? Action.dingTalkAuth
            : Action.wechatAuth,
        data: {},
      })
        .then((res: any) => {
          log(type, 'response:', res);
          verifyMobileAndLoginAction(type, res.code);
        })
        .catch(err => {
          log(type, 'err:', err);
          showInfo(defaultFailText({ ...err, desc: err.msg }));
        });
    };

    const verifyMobileAndLoginAction = async (type: PlatformType, authCode: string) => {
      showLoading();
      try {
        let organizationList;
        const [clientId] = await getAppClientId();
        if (type === PlatformType.Phone) {
          organizationList = await operatorLogin(authCode, clientId);
        } else {
          const res = await isBindMobile(type, authCode, clientId);
          console.log('res=========', res);
          if (!res.isBind) {
            hideLoading();
            const thirdUnionId = encodeURIComponent(res.thirdUnionId);
            const platformType = encodeURIComponent(type);
            uni.navigateTo({
              url: `/app-platform/login/bind-mobile?thirdUnionId=${thirdUnionId}&platformType=${platformType}`,
            });
            return;
          }
          organizationList = await thirdLogin(type, res.thirdUnionId, clientId);
        }

        await selectIdentity(organizationList as IOrganizationList);
        if (type === PlatformType.Phone) {
          setTimeout(() => {
            callBridge({
              service: Service.auth,
              action: Action.dismissOneKeyLoginView,
              data: {},
            });
          }, 300);
        }
      } catch (error: any) {
        hideLoading();
        showInfo(defaultFailText(error));
      }
    };

    watchEffect(() => {
      // 账号
      accountLoginDisableState.value = !accountValue.value || !passwordValue.value;
      // 手机号
      if (
        phoneValue.value &&
        phoneValue.value?.toString().length === 11 &&
        codeValue.value &&
        codeValue.value?.toString().length > 0
      ) {
        phoneLoginDisableState.value = false;
      } else {
        phoneLoginDisableState.value = true;
      }
    });

    watch(
      () => phoneValue.value,
      value => {
        if (value && value?.toString().length !== 11) phoneVerifyState.value = true;
        else phoneVerifyState.value = false;
      },
    );

    watch(
      () => showPassword.value,
      newVal => {
        pwdIconSrc.value = newVal ? iconNoLookPwd : iconLookPwd;
      },
    );

    const clearPwdData = () => {
      passwordValue.value = '';
    };

    onLoad(options => {
      console.log('app-platform/login/index onLoad options: ' + JSON.stringify(options));
      urlParams.value = options;
    });

    // #ifndef H5
    if (import.meta.env.VITE_SERVER_ENV !== EnvType.EnvType_PROD) {
      function devPackage(res: UniApp.OnAccelerometerChangeSuccess) {
        if (res.x && res.x > 0.7 && res.y && res.y > 0.7) {
          uni.navigateTo({
            url: '/dev-package/pages/index',
          });
        }
      }
      // onShow(() => {
      //   console.debug('devPackage onAccelerometerChange onShow');
      //   uni.onAccelerometerChange(devPackage);
      // });
      // onHide(() => {
      //   console.debug('devPackage offAccelerometerChange onHide');
      //   uni.offAccelerometerChange(devPackage);
      // });
      // onUnload(() => {
      //   console.debug('devPackage offAccelerometerChange onUnload');
      //   uni.offAccelerometerChange(devPackage);
      // });
    }
    // #endif
    console.log('=====', ClickLoginType);

    const clickAgreeAction = (type: ClickLoginType) => {
      agreementState.value = true;
      if (type == ClickLoginType.account) {
        accountLoginAction();
      } else if (type == ClickLoginType.mobile) {
        phoneLoginAction();
      } else {
        const platformType =
          type === ClickLoginType.weChat
            ? PlatformType.WeChat
            : type === ClickLoginType.dingTalk
            ? PlatformType.DingTalk
            : type === ClickLoginType.apple
            ? PlatformType.Apple
            : PlatformType.Phone;
        clickThirdPartLoginAction(platformType);
      }
      showTipAlert.value = ClickLoginType.none;
    };

    const clickCancelAction = () => {
      showTipAlert.value = ClickLoginType.none;
    };

    return {
      tabsTitle,
      primaryColor,
      accountLoginDisableState,
      phoneLoginDisableState,
      actionIndex,
      accountValue,
      passwordValue,
      showPassword,
      pwdIconSrc,
      agreementState,
      handleChangeTab,
      accountLoginAction,
      phoneLoginAction,
      phoneValue,
      codeValue,
      phoneVerifyState,
      forgetPwdAction,
      linkToAgreement,
      clickThirdPartLoginAction,
      icon_follow,
      marginTop,
      isApp,
      isHaveSafeBottom,
      isWeChat,
      goToPrivate,
      showTipAlert,
      clickAgreeAction,
      clickCancelAction,
    };
  },
});
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabs {
  margin: 48rpx auto 0;
  height: 88rpx;
  width: 400rpx;
}

.input-content {
  display: flex;
  flex-direction: column;
  padding: 16rpx 48rpx 0;

  .input-margin {
    margin-top: 25rpx;
  }
}

.custom-button {
  margin-top: 48rpx;
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

.forget-pwd {
  margin: 24rpx 48rpx 0rpx;
  position: relative;
  height: 48rpx;

  text {
    position: absolute;
    right: 0;
    font-size: 30rpx;
    color: $ui-color-primary;
  }
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

.color-primary-disable {
  background: #91caff;
}

:deep(.u-checkbox__label) {
  margin-left: 0rpx !important;
  margin-right: 0rpx !important;
}

.bottom {
  padding-bottom: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
