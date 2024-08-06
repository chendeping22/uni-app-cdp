<template>
  <page>
    <view class="container">
      <view class="title">{{ title }}</view>
      <view v-if="isBindMobile" class="phoneTitle">
        {{ getCaptcha(phoneValue, true, { start: 3, end: 7 }) }}
      </view>
      <login-input
        v-else
        v-model:val="phoneValue"
        placeholder="请输入手机号码"
        type="number"
        :maxlength="11"
        class="input-margin"
        @update="phoneValue = $event"
        @clickIcon="phoneValue = ''"
      ></login-input>
      <verify-input
        class="input-margin"
        :placeholder="'请输入短信验证码'"
        :phone-value="phoneValue"
        :code-value="codeValue"
        :check-account-flag="isBindMobile"
        @update="codeValue = $event"
      >
      </verify-input>
      <login-input
        v-model:val="newPwdValue"
        placeholder="密码"
        :maxlength="20"
        type="password"
        :src="pwdIconSrc"
        :show-password="showPassword"
        :force-show-clear-icon="true"
        class="input-margin"
        @update="newPwdValue = $event"
        @clickIcon="showPassword = !showPassword"
      ></login-input>
      <view class="tip">8-20位字母/数字/特殊符号至少2种组合</view>
      <view
        :class="['custom-button', confirmDisableState ? 'color-primary-disable' : '']"
        @click="confirmAction"
        >确定</view
      >
      <view class="custom-button input-margin back-button" @click="backAction">返回登录</view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import iconLookPwd from '@/app-platform/static/login/icon_look_pwd.svg';
import iconNoLookPwd from '@/app-platform/static/login/icon_no_look_pwd.svg';
import { loginStore } from '@/store/modules/login';
import { defaultFailText } from '@/utils/request';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import SparkMD5 from 'spark-md5';
import { ref, watch, watchEffect } from 'vue';
import { resetDefaultPwd, resetDefaultPwdAndBindMobile } from '../services/login';
import { RSAEncrypt } from '../utils/encrypt';
import { getCaptcha, validatePassword } from '../utils/tools';
import loginInput from './components/login-input.vue';
import verifyInput from './components/verify-input.vue';
import { defaultLoginAction } from './utils/default-login';
// store
const store = loginStore();
/** 3. your code here! */
// 手机号的值
const phoneValue = ref('');
// 验证码的值
const codeValue = ref('');
// 手机登录按钮的禁用状态 true 禁用
const confirmDisableState = ref(true);
// 新密码
const newPwdValue = ref('');
// 是否显示密码
const showPassword = ref(true);
// 密码图标
const pwdIconSrc = ref(iconNoLookPwd);
// 账号
const accountValue = ref('');
// 是否绑定手机
const isBindMobile = ref<boolean>(false);
// title
const title = ref('');
onLoad(option => {
  accountValue.value = decodeURIComponent(option?.account);
  isBindMobile.value = decodeURIComponent(option?.isBindMobile) === 'true';
  if (isBindMobile.value) {
    phoneValue.value = decodeURIComponent(option?.phoneNumber);
  }
  console.log('option', option, accountValue.value, isBindMobile.value);
  title.value = isBindMobile.value
    ? '您正在使用默认密码登录，为了您的账号安全，请设置新密码。'
    : '您正在使用默认密码登录，为了您的账号安全，请绑定手机并设置新密码。';
  console.log('=====', title);
});
watch(
  () => showPassword.value,
  newVal => {
    pwdIconSrc.value = newVal ? iconNoLookPwd : iconLookPwd;
  },
);
watchEffect(() => {
  if (
    phoneValue.value &&
    phoneValue.value?.toString().length === 11 &&
    codeValue.value &&
    codeValue.value?.toString().length > 0 &&
    newPwdValue.value &&
    newPwdValue.value?.toString().length >= 8
  ) {
    confirmDisableState.value = false;
  } else {
    confirmDisableState.value = true;
  }
});

// 返回
const backAction = () => {
  uni.navigateBack();
};

//确定
const confirmAction = async () => {
  if (confirmDisableState.value) {
    return;
  }

  try {
    showLoading();
    await validatePassword(newPwdValue.value);
    if (isBindMobile.value) {
      await resetDefaultPwd(
        RSAEncrypt(phoneValue.value) || '',
        SparkMD5.hash(newPwdValue.value),
        codeValue.value,
        accountValue.value,
      );
    } else {
      await resetDefaultPwdAndBindMobile(
        RSAEncrypt(phoneValue.value) || '',
        SparkMD5.hash(newPwdValue.value),
        codeValue.value,
        accountValue.value,
      );
    }
    await defaultLoginAction(phoneValue.value, newPwdValue.value);
    uni.$emit('clearPwd');
    hideLoading();
  } catch (error) {
    hideLoading();
    showInfo(defaultFailText(error));
  }
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  padding: 16rpx 48rpx 0;

  .title {
    color: #000000e0;
    font-size: 34rpx;
    margin-top: 48rpx;
    margin-bottom: 12rpx;
  }

  .phoneTitle {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    font-weight: bold;
    margin-top: 48rpx;
  }
  .input-margin {
    margin-top: 32rpx;
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

  .back-button {
    margin-top: 24rpx;
    background: #00000000;
    color: $ui-color-primary;
  }
  .tip {
    color: #00000073;
    font-size: 24rpx;
    margin-left: 32rpx;
    margin-top: 16rpx;
  }
  .color-primary-disable {
    background: #91caff;
  }
}
</style>
