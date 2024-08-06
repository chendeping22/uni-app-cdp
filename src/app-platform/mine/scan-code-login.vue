<template>
  <page>
    <view class="bg">
      <u-image
        width="100%"
        height="356rpx"
        :src="ScanBg"
        :fade="false"
        :show-loading="false"
      ></u-image>
    </view>
    <u-navbar
      back-icon-name="close"
      back-icon-size="32"
      back-icon-color="#000000E0"
      title-color="#000000E0"
      :background="{ background: '#00000000' }"
      :title-size="34"
      :border-bottom="false"
      title="登录"
      :height="52"
      :title-bold="true"
    >
    </u-navbar>
    <template v-if="isHaveEffectiveCode">
      <view class="logo">
        <u-image
          width="308rpx"
          height="218rpx"
          :src="ImpLogo"
          :fade="false"
          :show-loading="false"
        ></u-image>
      </view>
      <div class="title">确认登录星磐</div>
    </template>
    <template v-else>
      <view class="logo">
        <u-image
          width="216rpx"
          height="216rpx"
          :src="ImpError"
          :fade="false"
          :show-loading="false"
        ></u-image>
      </view>
      <div class="errorTitle">{{ errorInfo }}</div>
    </template>
    <view class="save" @click="loginAction">{{ isHaveEffectiveCode ? '登录' : '确定' }}</view>
  </page>
</template>

<script lang="ts" setup>
import { authQRCode, scanQRCode } from '@/app-platform/services/mine';
import ImpLogo from '@/app-platform/static/mine/imp_scan_logo.png';
import ImpError from '@/app-platform/static/mine/imp_scan_logo_error.png';
import ScanBg from '@/app-platform/static/mine/scan_bg_login.png';
import { defaultFailText } from '@/utils/request';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const scanCode = ref('');
const authCode = ref('');
const isHaveEffectiveCode = ref<boolean>(true);
const errorInfo = ref('二维码已失效，请重新获取');

onLoad(option => {
  scanCode.value = option?.scanCode;
  scanQRCodeAction();
});

const scanQRCodeAction = async () => {
  try {
    showLoading();
    const res = await scanQRCode(scanCode.value);
    isHaveEffectiveCode.value = res.status !== -1;
    authCode.value = res.authCode;
    hideLoading();
  } catch (error) {
    hideLoading();
    isHaveEffectiveCode.value = false;
    if (error && error?.desc && error?.desc.length > 0) {
      errorInfo.value = error?.desc;
    }
  }
};

const loginAction = async () => {
  if (!isHaveEffectiveCode.value) {
    uni.navigateBack();
    return;
  }

  try {
    showLoading();
    const res = await authQRCode(authCode.value);
    hideLoading();
    if (res.status === 1) {
      uni.navigateBack();
    } else {
      uni.navigateBack({
        success: () => {
          showInfo('登录失败，二维码已过期');
        },
        fail: () => {
          showInfo('登录失败，二维码已过期');
        },
      });
    }
  } catch (error) {
    hideLoading();
    showInfo(defaultFailText(error));
  }
};
</script>

<style scoped lang="scss">
.bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 0;
  height: 356rpx;
}

.logo {
  margin-top: 240rpx;
  display: flex;
  justify-content: center;
}

.title {
  display: flex;
  justify-content: center;
  margin-top: 48rpx;
  font-size: 32rpx;
  height: 48rpx;
  line-height: 48rpx;
  color: #000000e0;
}

.errorTitle {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;
  font-size: 28rpx;
  height: 40rpx;
  line-height: 40rpx;
  color: #666666;
}

.save {
  margin: 128rpx 32rpx 0;
  height: 104rpx;
  color: white;
  font-size: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 16rpx;
  background: $ui-color-primary;
}
</style>
