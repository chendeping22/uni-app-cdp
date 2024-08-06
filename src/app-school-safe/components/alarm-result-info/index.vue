<template>
  <view class="common-card components-result-info">
    <text class="common-title">处理结果</text>
    <view class="common-item">
      <text class="common-label">处理方式</text>
      <text class="common-value">{{ handleWay }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">处理描述</text>
      <text class="common-value">{{ handleDescription || '/' }}</text>
    </view>
    <view v-if="!isNil(disturbDesc)" class="common-item">
      <text class="common-label">免打扰</text>
      <text class="common-value">{{ disturbDesc }}</text>
    </view>
    <view v-if="!isNil(command)" class="common-item">
      <text class="common-label">其他操作</text>
      <text class="common-value">{{ command }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">处理人</text>
      <text class="common-value">{{ handleByName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">处理时间</text>
      <text class="common-value">
        {{ handleTime ? dayjs(handleTime).format('YYYY-MM-DD HH:mm:ss') : '/' }}
      </text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { isNil } from '@/utils/lodash-es';
import dayjs from 'dayjs';

interface IProps {
  handleWay: string;
  handleDescription: string;
  handleByName: string;
  handleTime: number | string;
  disturbDesc?: string;
  command?: string;
}

withDefaults(defineProps<IProps>(), {
  disturbDesc: undefined,
  command: undefined,
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
</style>
