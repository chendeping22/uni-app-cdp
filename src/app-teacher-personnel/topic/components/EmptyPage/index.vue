<script setup lang="ts">
import emptySvg from '@/app-teacher-personnel/static/topic/empty.svg';

withDefaults(
  defineProps<{
    description?: string;
  }>(),
  {
    description: '已删除',
  },
);
</script>
<template>
  <view class="wrap">
    <view class="img-wrap">
      <image class="img" :src="emptySvg"></image>
    </view>
    <view class="desc-wrap">
      <text>{{ description }}</text>
    </view>
    <view class="button-wrap">
      <slot></slot>
    </view>
  </view>
</template>
<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  padding-top: 112rpx;
  align-items: center;
  .img {
    width: 216rpx;
    height: 216rpx;
  }
  .img-wrap {
    margin-bottom: 32rpx;
  }
  .desc-wrap {
    margin-bottom: 48rpx;
    font-size: 32rpx;
    line-height: 44rpx;
    color: #00000073;
  }
}
</style>
