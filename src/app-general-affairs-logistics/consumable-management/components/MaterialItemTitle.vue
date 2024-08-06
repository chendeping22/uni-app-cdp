<script setup lang="ts">
import { Material } from '../types/material';

defineProps<{
  data: Material;
}>();
</script>

<template>
  <view class="material-item-title">
    <slot name="left"></slot>
    <view class="material-item-title-modal footnote-regular" v-if="data?.no">[{{ data.no }}]</view>
    <view class="material-item-title-name body-regular">{{ data.name }}</view>
    <slot name="right"></slot>
  </view>
</template>

<style lang="scss" scoped>
.material-item-title {
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
  &-modal {
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $color-text-description;
  }
  &-name {
    flex: 1;
    font-size: 32rpx;
    font-weight: 500;
    margin-right: 16rpx;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
