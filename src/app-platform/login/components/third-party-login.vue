<template>
  <view class="container">
    <view class="title">
      <view class="line"></view>
      <view class="text">第三方登录</view>
    </view>
    <view class="content">
      <view class="function">
        <view v-if="isSupportPhoneAuth" class="Phone" @click="clickFunction(PlatformType.Phone)">
          <u-image :src="Phone" width="96" height="96"></u-image>
        </view>
        <view v-if="isShowWeChat" class="WeChat" @click="clickFunction(PlatformType.WeChat)">
          <u-image :src="WeChat" width="96" height="96"></u-image>
        </view>
        <view class="DingTalk" @click="clickFunction(PlatformType.DingTalk)">
          <u-image :src="DingTalk" width="96" height="96"></u-image>
        </view>
        <view v-if="isIOSTerminal" class="Apple" @click="clickFunction(PlatformType.Apple)">
          <u-image :src="Apple" width="96" height="96"></u-image>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import Apple from '@/app-platform/static/login/icon_apple.png';
import DingTalk from '@/app-platform/static/login/icon_dingding.png';
import Phone from '@/app-platform/static/login/icon_phone.png';
import WeChat from '@/app-platform/static/login/icon_wechat.png';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { ETerminal } from '@/store/modules/env';
import { loginStore } from '@/store/modules/login';
import { ref } from 'vue';
import { PlatformType } from '../utils/index';

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['clickFunction']);
const clickFunction = (type: PlatformType) => {
  emits('clickFunction', type);
};
/** 3. your code here! */
// 解决iOS兼容性问题（部分机型需要超过一屏才可以）
const isIOSTerminal = loginStore().currentEnv.terminal === ETerminal.iOS;
const isShowWeChat = ref<boolean>(true);
if (isIOSTerminal) {
  callBridge({
    service: Service.auth,
    action: Action.isInstalledWeChat,
    data: {},
  })
    .then((res: any) => {
      console.log('isInstalledWeChat res', res);
      isShowWeChat.value = res.status === 1;
    })
    .catch(err => {
      console.log('isInstalledWeChat err', err);
      isShowWeChat.value = false;
    });
}

const isSupportPhoneAuth = ref<boolean>(false);
callBridge({
  service: Service.auth,
  action: Action.isSupportPhoneAuth,
  data: {},
})
  .then((res: any) => {
    console.log('isSupportPhoneAuth res', res);
    isSupportPhoneAuth.value = res.status === 1;
  })
  .catch(err => {
    console.log('isSupportPhoneAuth err', err);
    isSupportPhoneAuth.value = false;
  });
</script>

<style scoped lang="scss">
.container {
  .title {
    padding: 0 48rpx;
    height: 68rpx;
    display: flex;
    align-items: center;
    position: relative;

    .line {
      width: 100%;
      height: 2rpx;
      background: #0000000f;
    }

    .text {
      position: absolute;
      top: 0;
      left: calc(50% - 81rpx);
      width: 162rpx;
      height: 68rpx;
      font-size: 26rpx;
      line-height: 68rpx;
      text-align: center;
      color: #00000073;
      background-color: $ui-color-page-primary;
    }
  }

  .content {
    margin-top: 32rpx;
    margin-bottom: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .function {
      display: flex;
      height: 96rpx;

      .Phone {
        margin-right: 32rpx;
      }

      .WeChat {
        margin-right: 32rpx;
      }

      .Apple {
        margin-left: 32rpx;
      }
    }
  }
}
</style>
