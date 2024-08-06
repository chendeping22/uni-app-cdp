<template>
  <view class="content">
    <text class="title">如何注册家长账号？</text>
    <view class="line"></view>
    <image :src="help_feedback" />
  </view>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue';
export default defineComponent({
  setup(op) {
    const help_feedback =
      'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/help-feedback.png';
    onBeforeMount(() => {
      console.log('op', op);
      uni.setNavigationBarTitle({ title: op?.title || '' });
    });
    return { help_feedback };
  },
});
</script>

<style lang="scss" scoped>
.content {
  margin-top: 24rpx;
  padding-bottom: 24rpx;
  .title {
    width: 686rpx;
    height: 70rpx;
    font-family: PingFangSC-Medium;
    font-size: 44rpx;
    color: #1d2129;
    letter-spacing: 0;
    line-height: 70rpx;
    font-weight: 500;
    margin: 0 32rpx;
  }
  .line {
    height: 1px;
    background: #e5e6eb;
    margin: 48rpx 32rpx;
  }

  image {
    width: 100%;
    height: 4112rpx;
  }
}
</style>
