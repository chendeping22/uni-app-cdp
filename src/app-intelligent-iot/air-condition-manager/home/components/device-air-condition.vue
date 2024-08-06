<script lang="ts" setup>
import IconAirCondition from '@/app-intelligent-iot/static/air-condition/device_air_condition.svg';
import IconAirConditionOffline from '@/app-intelligent-iot/static/air-condition/device_air_condition_offline.svg';
import IconLocation from '@/app-intelligent-iot/static/air-condition/device_location.svg';
import IconLock from '@/app-intelligent-iot/static/air-condition/device_lock.svg';
import { showInfo } from '@/utils/tools';
import { computed } from 'vue';
import { DeviceAirCondition } from '../../utils/AirConditionType';
import { parseDisplayProp } from '../../utils/Utils';
const props = defineProps<{ device: DeviceAirCondition }>();

const deviceOnline = computed(() => props.device.onlineStatus == 'connected');
const showPowerOn = computed(() => {
  if (!deviceOnline.value) return false;

  return props.device.onOffStatus == 1;
});
const propMode = computed(() => findPropDisplay('AirConditionMode'));
const propTemperature = computed(() => findPropDisplay('Temp'));
const propWindSpeed = computed(() => findPropDisplay('windSpeedMode'));
const propWindSwing = computed(() => findPropDisplay('sweptWind'));
const hasWindSwingProp = computed(() => findProp('sweptWind') != null);
const showLockIcon = computed(() => props.device.isLocked == 1);

const findProp = (propCode: string) => props.device.props?.find(item => item.code == propCode);
const findPropDisplay = (propCode: string, defValue = '/') => {
  try {
    const prop = findProp(propCode);
    if (prop != null) {
      const res = parseDisplayProp(prop);
      return res == null || res == '' ? defValue : res;
    }
  } catch (error) {}
  return defValue;
};

const onClickLock = () => {
  if (!deviceOnline.value) {
    showInfo('设备已离线，无法控制');
    return;
  }
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/device/lock/index?id=${props.device.uuid}&name=${props.device.deviceName}`,
  });
};

const onClickControl = () => {
  if (!deviceOnline.value) {
    showInfo('设备已离线，无法控制');
    return;
  }
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/device/control/index?id=${props.device.uuid}&name=${props.device.deviceName}`,
  });
};
</script>

<template>
  <view class="cardRound k-f-c k-m-b-20 u-rela">
    <!-- 右上角在线/离线tag -->
    <view class="tag" :class="{ tagOfflineColor: !deviceOnline }">{{
      deviceOnline ? '在线' : '离线'
    }}</view>
    <!-- 顶部图标、名称等 -->
    <view class="k-f topPart">
      <view class="rootIcon" :class="{ colorPowerOff: !showPowerOn }">
        <u-image
          :src="showPowerOn ? IconAirCondition : IconAirConditionOffline"
          :width="80"
          :height="80"
        ></u-image>
        <view v-if="showLockIcon" class="lockBg">
          <u-image class="k-m-b-10" :src="IconLock" :width="24" :height="24"></u-image>
        </view>
      </view>
      <view class="k-m-l-28">
        <view class="deviceName">{{ device.deviceName }}</view>
        <view class="k-f k-m-t-8">
          <u-image :src="IconLocation" :width="32" :height="32"></u-image>
          <view class="location">{{ device.spaceFullName }}</view></view
        >
      </view>
    </view>
    <!-- 中间信息栏 -->
    <view class="middlePart k-f">
      <view class="k-f-1">
        <view class="propInfo">模式：{{ propMode }}</view>
        <view class="propInfo">温度：{{ propTemperature }}</view>
      </view>
      <view class="k-f-1 k-m-t-8">
        <view class="propInfo">风速：{{ propWindSpeed }}</view>
        <view v-if="hasWindSwingProp" class="propInfo">扫风：{{ propWindSwing }}</view>
      </view>
    </view>
    <!-- 底部按钮 -->
    <view class="bottomPart k-f-center">
      <view class="k-f-1 btn" @click="onClickLock">锁定</view>
      <view class="divider"></view>
      <view class="k-f-1 btn" @click="onClickControl">控制</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
@import '@/app-intelligent-iot/air-condition-manager/style/AirConditionStyle.scss';

.tag {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4rpx 8rpx;

  border-radius: 8rpx;
  background: #e6f4ff;

  color: #1677ff;
  font-size: 22rpx;
}

.tagOfflineColor {
  color: #ff4d4f;
  background: #fff1f0;
}

.topPart {
  margin: 32rpx 32rpx 0;

  .rootIcon {
    width: 96rpx;
    height: 96rpx;

    padding: 8rpx;

    border-radius: 16rpx;
    background: #e6f4ff;

    position: relative;

    .lockBg {
      width: 40rpx;
      height: 40rpx;

      padding: 0;

      display: flex;
      justify-content: center;
      align-items: center;

      position: absolute;
      right: -4rpx;
      bottom: -4rpx;
      border-radius: 200rpx;
      border: 4rpx solid #fff;
      background: #faad14;
    }
  }

  .colorPowerOff {
    background: #0000000f;
  }

  .deviceName {
    color: #000000e0;
    font-size: 32rpx;
    font-weight: bold;
    line-height: 44rpx;
    @include ellipsis-some-line(1);
  }

  .location {
    margin-left: 8rpx;
    font-size: 24rpx;
    color: #00000073;
    line-height: 32rpx;
    @include ellipsis-some-line(2);
  }
}

.middlePart {
  margin: 16rpx 32rpx 0;
}

.propInfo {
  color: #000000a6;
  font-size: 26rpx;
  line-height: 36rpx;
}

.bottomPart {
  margin-top: 32rpx;
  height: 80rpx;
  border-top: 1rpx solid #0000000f;

  .btn {
    color: #1677ff;
    text-align: center;
    font-size: 30rpx;
    font-weight: bold;
  }

  .divider {
    width: 2rpx;
    height: 48rpx;
    background: #0000000f;
  }
}
</style>
