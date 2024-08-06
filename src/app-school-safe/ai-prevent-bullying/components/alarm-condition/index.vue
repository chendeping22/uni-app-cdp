<template>
  <view class="common-card components-result-info">
    <text class="common-title">告警信息</text>
    <view class="font-title color-base">{{ condition }}</view>
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  condition?: string;
}

withDefaults(defineProps<IProps>(), {
  condition: '',
});
</script>

<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
</style>
