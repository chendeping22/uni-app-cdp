<template>
  <view class="components-statistics-info">
    <view class="common-card energy-card">
      <view class="energy-type"><view class="marker red" />告警总数</view>
      <text class="value">{{ total > 99999 ? '99999+' : total }}</text>
    </view>
    <view class="common-card energy-card">
      <view class="energy-type"><view class="marker blue" />已处理</view>
      <text class="value">{{ processed > 99999 ? '99999+' : processed }}</text>
    </view>
    <view class="common-card energy-card">
      <view class="energy-type"><view class="marker orange" />未处理</view>
      <text class="value">{{ notProcessed > 99999 ? '99999+' : notProcessed }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
defineProps({
  processed: {
    type: Number,
    default: 0,
  },
  notProcessed: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});
</script>
<style scoped lang="scss">
/* @import './common-info.scss'; */
.components-statistics-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  > view {
    margin: $ui-gap-default 0 $ui-gap-large;
  }
  > view:nth-child(3) {
    margin-right: 0;
  }
  .energy-card {
    width: 208rpx;
    height: 148rpx;
    .energy-type {
      display: flex;
      align-items: center;
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
      letter-spacing: 0;
      line-height: 24rpx;
      margin-bottom: $ui-gap-default;
      .marker {
        width: 8rpx;
        height: 20rpx;
        background: $ui-color-warnning;
        border-radius: $ui-radius-small;
        margin-right: $ui-gap-xxs;
      }
      .orange {
        background: $ui-color-warnning;
      }
      .blue {
        background: $ui-color-blue;
      }
      .red {
        background: $ui-color-error;
      }
    }
    .value {
      width: 100%;
      display: inline-block;
      /* overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap; */
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
      letter-spacing: 0;
      line-height: 40rpx;
      font-weight: 600;
    }
  }

  .common-card {
    background: $ui-color-white;
    box-shadow: 0rpx 0rpx 20rpx 0rpx rgba(24, 25, 68, 0.05);
    border-radius: $ui-radius-xl;
    padding: $ui-gap-large;
    box-sizing: border-box;
  }
}
</style>
