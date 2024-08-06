<template>
  <view class="detail-card">
    <view class="detail-card-header">总分 </view>
    <view class="detail-chart-wrap" v-if="Object.keys(totalSource).length">
      <c-circle-progress
        :percent="(totalSource.totalScore / totalSource.baseScore) * 100"
        :height="186"
        :width="388"
        :start-angle="270"
        :end-angle="90"
        :border-width="24"
      >
        <view class="extend-info">
          <view class="count">{{ totalSource.totalScore || 0 }}</view>
          <view>{{ type === 1 ? '月平均分' : '周总分' }}</view>
        </view>
      </c-circle-progress>
      <view class="detail-data">
        <view class="detail-data-item" style="margin-right: 24rpx">
          <view class="detail-data-item-num">{{ totalSource.evaluationCount || 0 }}</view>
          <view class="detail-data-item-title">评价数量</view>
        </view>
        <view class="detail-data-item">
          <view class="detail-data-item-num">{{ totalSource.gradeRank || '/' }}</view>
          <view class="detail-data-item-title">年级排名</view>
        </view>
      </view>
    </view>
    <u-empty-custom v-else text="暂无数据" mode="data" card></u-empty-custom>
  </view>
</template>

<script setup lang="ts">
import { ITotalSource } from '@/app-class-evaluation/services/report';
defineProps<{
  totalSource: ITotalSource;
  type: number;
}>();
</script>

<style lang="scss" scoped>
.detail-card {
  padding-bottom: 12rpx;
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  &-header {
    padding: 0 32rpx;
    height: 96rpx;
    line-height: 96rpx;
    font-weight: 500;
    font-family: 'PingFang SC';
    color: #000000;
    font-size: 32rpx;
  }
}
.detail-chart-wrap {
  padding: 32rpx 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.extend-info {
  margin-top: 52rpx;
  text-align: center;
  color: #00000073;
  font-size: 24rpx;
  .count {
    overflow: hidden;
    color: #000000e0;
    text-overflow: ellipsis;
    font-family: 'PingFang SC';
    font-size: 40rpx;
    font-style: normal;
    font-weight: bold;
    line-height: 52rpx;
  }
}
.detail-data {
  width: 100%;
  margin-top: 48rpx;
  display: flex;
  &-item {
    height: 112rpx;
    border-radius: 16rpx;
    background: #00000005;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &-num {
      color: #000000e0;
      font-family: 'PingFang SC';
      font-size: 32rpx;
      font-style: normal;
      font-weight: bold;
      line-height: 44rpx;
    }
    &-title {
      color: #00000073;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
}
</style>
