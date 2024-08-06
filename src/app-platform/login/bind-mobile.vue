<template>
  <view class="page container">
    <view class="title"> 您尚未绑定手机，为了您的账号安全，请绑定手机号。 </view>
    <login-input
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
      :check-account-flag="false"
      @update="codeValue = $event"
    >
    </verify-input>
    <view
      :class="['custom-button', confirmDisableState ? 'color-primary-disable' : '']"
      @click="confirmAction"
      >确定</view
    >
    <view class="custom-button input-margin back-button" @click="backAction">返回登录</view>
  </view>
</template>

<script lang="ts" setup>
import { defaultFailText } from '@/utils/request';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref, watchEffect } from 'vue';
import { bindMobile } from '../services/login';
import { RSAEncrypt } from '../utils/encrypt';
import loginInput from './components/login-input.vue';
import verifyInput from './components/verify-input.vue';
import { PlatformType } from './utils';
import { defaultLoginAction, thirdLoginAction } from './utils/default-login';
/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits([]);
// 手机号的值
const phoneValue = ref('');
// 验证码的值
const codeValue = ref('');
// 账号
const accountValue = ref('');
// 密码
const pwdValue = ref('');
// 第三方unionId
const thirdUnionId = ref('');
// 第三方平台
const platformType = ref<PlatformType>();
// 手机登录按钮的禁用状态 true 禁用
const confirmDisableState = ref(true);

onLoad(option => {
  accountValue.value = decodeURIComponent(option?.account);
  pwdValue.value = decodeURIComponent(option?.password);
  thirdUnionId.value = decodeURIComponent(option?.thirdUnionId);
  platformType.value = decodeURIComponent(option?.platformType) as PlatformType;
});

watchEffect(() => {
  if (
    phoneValue.value &&
    phoneValue.value?.toString().length === 11 &&
    codeValue.value &&
    codeValue.value?.toString().length > 0
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
    if (thirdUnionId.value.length > 0) {
      await thirdLoginAction(
        platformType.value as PlatformType,
        thirdUnionId.value,
        RSAEncrypt(phoneValue.value),
        codeValue.value,
      );
    } else {
      await bindMobile(RSAEncrypt(phoneValue.value) || '', codeValue.value, accountValue.value);
      await defaultLoginAction(phoneValue.value, pwdValue.value);
    }
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

  .color-primary-disable {
    background: #91caff;
  }

  .back-button {
    margin-top: 24rpx;
    background: #00000000;
    color: $ui-color-primary;
  }
}
</style>
