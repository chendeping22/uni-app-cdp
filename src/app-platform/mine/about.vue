<template>
  <page>
    <view class="logo-view">
      <image class="logo" :src="icon_follow" />
      <text class="app-name">{{ applicationName }}</text>
      <text class="app-version">{{ version }}</text>
    </view>
    <view
      style="
        border-radius: 16rpx;
        margin: 88rpx 32rpx;
        box-shadow: 0px 2rpx 4rpx 0px rgba(0, 0, 0, 0.04);
        background-color: white;
        overflow: hidden;
      "
    >
      <view v-if="isApp" class="group-top" @click="checkNewVersion">
        <text class="group-top-font">版本更新</text>
        <view v-if="hasNew">
          <u-tag text="NEW" type="error" shape="circle" />
        </view>
        <image class="arrow-size" :src="arrow_right" />
      </view>
      <view class="line" />
      <view class="group-top" @click="goToPrivate">
        <text class="group-top-font">隐私政策</text>
        <image class="arrow-size" :src="arrow_right" />
      </view>
      <view class="line" />
      <view class="group-top" @click="gotoUserAgreement">
        <text class="group-top-font">用户协议</text>
        <image class="arrow-size" :src="arrow_right" />
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { checkAppVersion } from '@/utils/check-version';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { goToPrivate } from '../utils/tools';
import arrow_right from '/static/arrow_right.svg';
import icon_follow from '/static/icon_follow.svg';

const hasNew = ref(false);
const version = ref();
const applicationName = import.meta.env.VITE_APP_NAME;
let isApp = ref(false);
// #ifdef APP-PLUS
isApp.value = true;
const tempVersion = plus.runtime.version;
version.value =
  tempVersion !== undefined && tempVersion.length !== 0 ? plus.runtime.version : '1.0.0';
// #endif
// #ifdef MP-WEIXIN
const { miniProgram } = uni?.getAccountInfoSync?.() || {};
version.value =
  miniProgram.version !== undefined && miniProgram.version.length !== 0
    ? `${'V' + miniProgram.version}`
    : '1.0.0';
isApp.value = false;
// #endif

const gotoUserAgreement = function () {
  uni.navigateTo({
    url: '/app-platform/login/user-agreement', // 用户协议
  });
};

const checkNewVersion = async function () {
  // #ifdef APP-PLUS
  uni.removeStorage({ key: 'ignoreVersion' });
  checkAppVersion(true);
  hasNew.value = uni.getStorageSync('hasNewVersion');
  // #endif
};

const checkVersion = () => {
  hasNew.value = uni.getStorageSync('hasNewVersion');
};

onMounted(() => {
  checkVersion();
  uni.$on('check-new-version', checkVersion);
});

onBeforeUnmount(() => {
  uni.$off('check-new-version', checkVersion);
});
</script>

<style lang="scss" scoped>
.content-column {
  flex-direction: column;
}
.content-row {
  flex-direction: row;
}
.content-flex {
  display: flex;
  flex-direction: row;
}
.arrow-size {
  width: 40rpx;
  height: 40rpx;
}
.group-top {
  align-items: center;
  padding: 24rpx 36rpx;
  @extend .content-flex;
  @extend .content-row;
}
.group-top-font {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  flex: 1 1 0%;
}
.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  margin-left: 32rpx;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}

.logo-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32rpx 24rpx;

  .logo {
    width: 176rpx;
    height: 176rpx;
    margin-top: 64rpx;
    border-radius: 48rpx;
  }

  .app-name {
    color: #000000e0;
    font-size: 40rpx;
    font-style: normal;
    font-weight: 500;
    margin-top: 32rpx;
  }

  .app-version {
    color: #00000073;
    font-size: 30rpx;
    font-style: normal;
    font-weight: 400;
    margin-top: 8rpx;
  }
}
</style>
