<template>
  <view class="common-card components-device-info">
    <text class="common-title">设备信息</text>
    <view class="common-item">
      <text class="common-label">设备名称</text>
      <text class="common-value">{{ detail?.deviceName || '/' }}</text>
    </view>
    <view
      v-if="[AlarmTypeEnum.BEHAVIOR, AlarmTypeEnum.FACE].includes(alarmType)"
      class="common-item"
    >
      <text class="common-label">场景归属</text>
      <text class="common-value">{{ detail?.sceneName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">归属空间</text>
      <text class="common-value">{{ detail?.spaceFullName || detail?.spaceName || '/' }}</text>
    </view>
    <view v-if="[AlarmTypeEnum.BEHAVIOR].includes(alarmType)" class="common-item">
      <text class="common-label">布控算法</text>
      <text class="common-value">{{ detail?.typeName || '/' }}</text>
    </view>
    <view v-if="[AlarmTypeEnum.ACCESS, AlarmTypeEnum.FIRE].includes(alarmType)" class="common-item">
      <text class="common-label">产品名称</text>
      <text class="common-value">{{ detail?.productName || '/' }}</text>
    </view>
    <view v-for="item in extraInfo" :key="item.label" class="common-item">
      <text class="common-label">{{ item.label }}</text>
      <text class="common-value">{{ item.value }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
interface IProps {
  detail: any;
  alarmType: AlarmTypeEnum;
  extraInfo: {
    label: string;
    value: any;
  }[];
}

withDefaults(defineProps<IProps>(), {
  detail: () => {},
  extraInfo: () => [],
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
</style>
