<script setup lang="ts">
defineProps<{
  title?: string;
  content?: string;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <view :class="['form-item', className || '']" @click="emit('click')">
    <view class="form-item-title body-regular">
      <slot name="title">{{ title }}</slot>
    </view>
    <view class="form-item-content body-regular">
      <slot name="content">{{ content }}</slot>
    </view>
    <slot name="right"></slot>
  </view>
</template>

<style lang="scss" scoped>
.form-item {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding-right: 32rpx;
  border-bottom: 1rpx solid $color-split;
  &-auto {
    height: auto;
    align-items: flex-start;
    padding-top: 14rpx;
    padding-bottom: 24rpx;
    .form-item-title {
      padding-top: 8rpx;
    }
  }
  &.hide-line {
    border-bottom: none;
  }
  &.overflow-visible {
    overflow: visible;
  }
  &-title {
    color: $color-text-heading;
    width: 180rpx;
    margin-right: 32rpx;
  }
  &-content {
    flex: 1;
    text-align: right;
    color: $color-text-heading;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: normal;
  }
  &-right {
    margin-left: 8rpx;
  }
}
</style>
