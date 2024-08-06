<script lang="ts" setup>
import IconAirCondition from '@/app-intelligent-iot/static/air-condition/device_air_condition.svg';
import IconGroup from '@/app-intelligent-iot/static/air-condition/group_icon.svg';
defineProps<{ title: string; deviceOrGroup: boolean }>();
</script>

<template>
  <view class="cardRound k-h-112 k-f-center k-p-l-32 k-p-r-32">
    <u-image v-if="deviceOrGroup" :src="IconAirCondition" :width="80" :height="80"></u-image>
    <u-image v-else :src="IconGroup" :width="64" :height="64"></u-image>
    <view class="k-m-l-24 title">{{ title }}</view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
@import '@/app-intelligent-iot/air-condition-manager/style/AirConditionStyle.scss';

.title {
  color: #000000;
  font-size: 32rpx;
  font-weight: bold;
  @include ellipsis-some-line(1);
}
</style>
