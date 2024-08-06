<template>
  <view :class="[className]">
    <view class="ptb-s color-placeholder bold" >{{ title }} </view>
    <slot />
  </view>
</template>
<script lang="ts" setup>
defineProps({
  className: { type: String, default: '' },
  title: { type: String, default: '' },
});
</script>
<style scoped lang="scss">
.ptb-s {
  margin-left: 64rpx;
  padding-top: 36rpx;
  padding-bottom: 16rpx;
}
.color-placeholder {
  color: #86909c;
}
.bold {
  font-weight: 400;
}
</style>
