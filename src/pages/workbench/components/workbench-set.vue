<template>
  <view class="u-flex u-row-center u-m-t-24"
    ><u-icon
      label="工作台设置"
      name="setting"
      size="36"
      margin-left="15"
      label-size="30"
      label-color="#000000e0"
      :custom-style="{
        padding: '20rpx 25rpx',
        height: '80rpx',
        background: '#ffffff',
        borderRadius: '16rpx',
        boxShadow: '0 0 4px #0000000a',
        zIndex: 1,
      }"
      @click="goToWidgetSet"
    ></u-icon>
  </view>
</template>

<script lang="ts" setup>
const goToWidgetSet = () => {
  uni.navigateTo({ url: '/app-platform/workbench/widget-set' });
};
</script>

<style scoped lang="scss"></style>
