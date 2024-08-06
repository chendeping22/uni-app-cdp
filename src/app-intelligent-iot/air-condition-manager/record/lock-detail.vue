<script setup lang="ts">
import DayJS from 'dayjs';
import { useCondition } from '../store/useCondition';

const { lockRecord = {} } = useCondition();
</script>

<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <template v-if="lockRecord.status === 1">
          <u-icon name="checkmark-circle-fill" color="#52C41A" top="4" size="120"></u-icon>
          <text class="result">执行成功</text>
        </template>
        <template v-if="lockRecord.status === -1">
          <image class="loading-icon" src="@/app-intelligent-iot/static/image/icon_loading2.png"></image>
          <text class="result">执行中</text>
        </template>
        <template v-if="lockRecord.status === 0">
          <u-icon name="close-circle-fill" color="#FF4D4F" top="4" size="120"></u-icon>
          <text class="result">执行失败</text>
        </template>
        <view class="secondary-txt">
          操作人：{{ lockRecord.createName || '/' }}
          {{ lockRecord.startTime ? DayJS(lockRecord.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </view>
      </view>
      <view class="ul pt-xl">
        <view class="li">
          <text class="label">设备名称</text>
          <text class="desc">{{ lockRecord.deviceName || '/' }}</text>
        </view>
        <view class="li">
          <text class="label">控制方式</text>
          <text class="desc">{{ lockRecord.controlWayDesc || '/' }}</text>
        </view>
        <view class="li">
          <text class="label">来源名称</text>
          <text class="desc">{{ lockRecord.originDesc || '/' }}</text>
        </view>
        <view class="li">
          <text class="label">上报时间</text>
          <text class="desc">{{ lockRecord.reportTime ? DayJS(lockRecord.reportTime).format('YYYY-MM-DD HH:mm:ss') : '/' }}</text>
        </view>
        <view class="li">
          <text class="label">控制内容</text>
          <text class="desc">{{ lockRecord.propCodeRemark || '/' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 24rpx 32rpx;
  .card {
    padding: 48rpx 32rpx;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
      .loading-icon {
        width: 120rpx;
        height: 120rpx;
        animation: 2s linear 0s infinite ring;
      }
      .result {
        font-size: 40rpx;
        font-weight: bold;
        line-height: 52rpx;
      }
      .secondary-txt {
        font-size: 30rpx;
        line-height: 40rpx;
        color: rgba(0, 0, 0, 0.45);
      }
    }
    .ul {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      .li {
        display: flex;
        align-items: flex-start;
        font-size: 30rpx;
        .label {
          width: 144rpx;
          color: rgba(0, 0, 0, 0.65);
        }
        .desc {
          flex: 1;
          word-break: break-all;
          color: rgba(0, 0, 0, 0.88);
        }
      }
    }
  }
}
@keyframes ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>