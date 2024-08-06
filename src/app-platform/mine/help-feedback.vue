<template>
  <page>
    <view
      style="
        border-radius: 16rpx;
        margin: 24rpx 32rpx;
        box-shadow: 0px 2rpx 4rpx 0px rgba(0, 0, 0, 0.04);
        background-color: white;
        overflow: hidden;
      "
    >
      <view class="group-top">
        <text class="group-top-title-font">常见问题</text>
      </view>
      <view class="group-top" @click="gotoHelpFeedbackDetail('如何注册家长帐号？')">
        <text class="group-top-font">如何注册家长帐号？</text>
        <image class="arrow-size" :src="arrow_right" />
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import arrow_right from '/static/arrow_right.svg';

const gotoHelpFeedbackDetail = function (title: string) {
  uni.navigateTo({
    url: `/app-platform/mine/help-feedback-detail?title=${title}`, // 帮助与反馈详情页
  });
};
</script>

<style lang="scss" scoped>
.content-column {
  flex-direction: column;
}
.content-row {
  flex-direction: row;
}
.content-flex {
  display: flex;
  flex-direction: row;
}
.arrow-size {
  width: 40rpx;
  height: 40rpx;
}
.group-top {
  align-items: center;
  padding: 24rpx 36rpx;
  @extend .content-flex;
  @extend .content-row;
}
.group-top-title-font {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 600;
  line-height: 48rpx;
  flex: 1 1 0%;
}
.group-top-font {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  flex: 1 1 0%;
}
.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  margin-left: 32rpx;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}
</style>
