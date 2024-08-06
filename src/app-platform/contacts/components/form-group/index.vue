<template>
  <view class="form-group-content">
    <slot />
  </view>
</template>
<script setup lang="ts">
defineProps({
  /** 搜索时使用 */
  className: {
    type: String,
    default: '',
  },
});
</script>
<style scoped lang="scss">
.form-group-content {
  margin: 0 32rpx;
  padding: 0 32rpx;
  border-radius: 16rpx;
  background: white;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
}
</style>
