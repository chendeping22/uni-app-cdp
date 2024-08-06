<template>
  <view class="content">
    <view v-if="!stepIndex" class="clip-shape step-one"> </view>
    <view v-if="!stepIndex" class="guide-container step-one">
      <view class="guide-title">周行事历筛选</view>
      <view class="guide-text">点击这里可切换视角、筛选查看不同的范围的周行事历安排。</view>
      <view class="guide-btn">
        <text class="btn-text" @click="onFinish">跳过</text>
        <view class="btn-primary" @click="onNext">下一步(1/2)</view>
      </view>
    </view>
    <view v-if="stepIndex" class="clip-shape step-two"> </view>
    <view v-if="stepIndex" class="guide-container step-two">
      <view class="guide-title">添加周行事历</view>
      <view class="guide-text">点击“+”可快速添加本单位/部门/个人日程安排。</view>
      <view class="guide-btn">
        <view class="btn-primary" @click="onFinish">知道了</view>
      </view>
    </view>
    <!-- <view class="masked"></view> -->
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits(['finished']);
const stepIndex = ref(0);
const onFinish = () => {
  console.log('finish');
  emit('finished');
};
const onNext = () => {
  stepIndex.value = 1;
};
</script>

<style lang="scss" scoped>
.content {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 999;
}
.clip-shape {
  outline: 9999px solid rgba(0, 0, 0, 0.5);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  &.step-one {
    width: 736rpx;
    height: 86rpx;
    margin: 8rpx 1%;
    border-radius: 10rpx;
  }
  &.step-two {
    width: 128rpx;
    height: 128rpx;
    margin-left: 584rpx;
    margin-top: calc(100vh - 260rpx);
    border-radius: 64rpx;
  }
}
.guide-container {
  position: absolute;

  margin-left: -288rpx;
  width: 576rpx;
  height: 280rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  z-index: 1001;
  &::after {
    position: absolute;
    width: 0px;
    height: 0px;
    margin-left: -10rpx;
    border: 20rpx solid transparent;
    content: '\200B';
  }
  &.step-one {
    top: 128rpx;
    left: 50%;
    &::after {
      top: -16px;
      left: 50%;
      border-bottom-color: #fff;
    }
  }
  &.step-two {
    left: 60%;
    margin-top: calc(100vh - 560rpx);
    &::after {
      bottom: -16px;
      right: 70rpx;
      border-top-color: #fff;
    }
  }
}
.guide-title {
  padding-bottom: 16rpx;
  font-size: 32rpx;
  color: #000000e0;
  font-weight: 500;
}
.guide-text {
  color: #000000a6;
  font-size: 26rpx;
  line-height: 36rpx;
}
.guide-btn {
  margin-top: 32rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
  margin-right: 0;
  margin-left: 24rpx;
  border-radius: 16rpx;
  padding: 0 16rpx;
  height: 64rpx;
  font-size: 30rpx;
  line-height: 64rpx;
  text-align: center;
}
.btn-text {
  color: #1677ff;
  font-size: 30rpx;
}
// .masked {
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   -webkit-mask: url('./circle.png');
//   mask: url('./circle.png') no-repeat 64rpx;
// }
</style>
