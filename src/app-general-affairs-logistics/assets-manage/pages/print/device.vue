<script setup lang="ts">
import printIcon from '@/app-general-affairs-logistics/static/assets-manage/print_dark.svg';
import { onHide, onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { onUnmounted, ref } from 'vue';

// #ifdef APP-PLUS
import { usePrintDevicesForApp } from '../../store/usePrintDevicesForApp';
// #endif

// #ifndef APP-PLUS
import { usePrintDevices } from '../../store/usePrintDevices';
// #endif

let printDevicesStore;

// #ifdef APP-PLUS
printDevicesStore = usePrintDevicesForApp();
// #endif

// #ifndef APP-PLUS
printDevicesStore = usePrintDevices();
// #endif

const { handleConnect, checkDeviceAndSearch, handleSearchDevice, updateLinkStatus } =
  printDevicesStore;

const timer = ref<any>(null);

onLoad(() => {
  if (!printDevicesStore.printDevice) {
    uni.showLoading({
      title: '初始化服务...',
    });
  }
});

onShow(() => {
  if (printDevicesStore.printDevice) {
    updateLinkStatus();
  }

  timer.value = setInterval(() => {
    if (printDevicesStore.blueErrCode) {
      checkDeviceAndSearch();
    } else {
      handleSearchDevice();
    }
  }, 5000);
});

onPullDownRefresh(() => {
  if (printDevicesStore.blueErrCode) {
    checkDeviceAndSearch();
  } else {
    handleSearchDevice();
  }
});

onHide(() => {
  timer.value && clearInterval(timer.value);
});

onUnmounted(() => {
  timer.value && clearInterval(timer.value);
});
</script>

<template>
  <page custom-overflow="visible">
    <view class="device-page">
      <view class="cell-wrap-title footnote-regular">附近设备</view>
      <view v-if="printDevicesStore.deviceData.length" class="cell-wrap">
        <u-cell-item
          v-for="item in printDevicesStore.deviceData"
          :key="item.name"
          :title="item.name"
          :arrow="false"
          :title-style="{ marginLeft: '32rpx' }"
          @click="handleConnect(item)"
        >
          <template #icon>
            <u-image
              :src="printIcon"
              width="48"
              height="48"
              :show-loading="false"
              :fade="false"
            ></u-image>
          </template>
          <template #right-icon>
            <view
              v-if="
                printDevicesStore.isLinked &&
                printDevicesStore.printDevice &&
                item.deviceId === printDevicesStore.printDevice.deviceId
              "
              class="icon-48 flex-center"
            >
              <u-icon name="checkmark" color="rgba(22, 119, 255, 1)" size="40" />
            </view>
          </template>
        </u-cell-item>
      </view>
      <view v-else class="cell-wrap empty">
        <!-- <view v-if="printDevicesStore.blueErrCode" class="empty-bluetooth">
        <u-image :src="bluetooth" width="104rpx" height="104rpx" />
        <view class="empty-bluetooth-tip callout-regular">请先启用蓝牙或检查蓝牙是否异常</view>
      </view> -->
        <view>
          <u-empty-custom text="未找到任何蓝牙打印机" mode="search" />
          <view class="empty-tips">可能存在的原因: </view>
          <view class="empty-tips">1、未识别到打印机，可能打印机未成功开机</view>
          <view class="empty-tips">2、无法连接蓝牙，可能蓝牙未打开</view>
          <view class="empty-tips">3、是否已授权获取您手机定位或未开启手机定位服务</view>
        </view>
      </view>
    </view>
  </page>
</template>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.device-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cell-wrap {
  margin: 24rpx 32rpx;
  background-color: $colorWhite;
  box-shadow: $boxShadow;
  border-radius: 16rpx;
  &-title {
    padding: 48rpx 64rpx 0;
    font-size: 26rpx;
  }
  :deep(.u-cell-hover) {
    background-color: $colorWhite;
  }
  &.empty {
    // height: 400rpx;
    padding: 80rpx 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.empty-tips {
  color: $color-text-description;
  padding-top: 16rpx;
}

.empty-bluetooth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &-tip {
    margin-top: 52rpx;
    color: $color-text-description;
  }
}
</style>
