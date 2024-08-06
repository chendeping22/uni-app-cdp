<template>
  <view class="new-card">
    <slot name="header">
      <view class="new-card-header"> {{ title }} </view>
    </slot>
    <view class="new-card-content">
      <slot name="content"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.new-card {
  margin-bottom: 24rpx;
  &-header {
    padding-left: 32rpx;
    color: #000000a6;
    font-size: 26rpx;
  }
  &-content {
    background: $color-background-base;
    margin-top: 16rpx;
    box-shadow: $shadow-light-down-base;
    border-radius: 16rpx;
    color: #000000e0;
    font-size: 32rpx;
  }
}
</style>
