<script lang="ts" setup>
const indicatorStyle = `height: 50px;`;
</script>

<template>
  <u-popup v-model="showModePicker" mode="bottom">
    <picker-view :indicator-style="indicatorStyle" class="picker-view">
      <picker-view-column>
        <view>111</view>
        <view>222</view>
      </picker-view-column>
    </picker-view>
  </u-popup>
</template>

<style lang="scss" scoped>
.picker-view {
  width: 750rpx;
  height: 600rpx;
}
</style>
