<script setup lang="ts">
import DayJS from 'dayjs';
import { CTRL_WAY, type TLockRecord } from '../../type';

const props = defineProps({
  isGroup: {
    type: Boolean,
    default: () => false,
  },
  lockData: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits<{
  (e: 'onItemClick', data: TLockRecord): void;
}>();
</script>

<template>
  <template v-if="Object.keys(props.lockData).length > 0">
    <view class="group" v-for="(val, key) in props.lockData" :key="key">
      <view class="time">{{ key }}</view>
      <view class="card" v-for="item in val" :key="item.id" @click="emit('onItemClick', item)">
        <view class="flex">
          <view class="record-main">
            <view class="flex">
              <view class="h2">
                <template v-if="props.isGroup">
                  <u-tag v-if="item.controlWay === CTRL_WAY.Group" text="组控" size="mini" type="primary" border-color="#ecf5ff" />
                  <u-tag v-if="item.controlWay === CTRL_WAY.Lock" text="锁定" size="mini" type="warning" border-color="#fdf6ec" />
                </template>
                <text class="record-title">{{ item.originDesc }}</text>
              </view>
              <view class="result" v-if="item.status === 1">
                <u-icon name="checkmark-circle-fill" color="#52C41A" top="2" size="32"></u-icon>
                <text>执行成功</text>
              </view>
              <view class="result" v-if="item.status === -1">
                <image class="loading-icon" src="@/app-intelligent-iot/static/image/icon_loading2.png"></image>
                <text>执行中</text>
              </view>
              <view class="result" v-if="item.status === 0">
                <u-icon name="close-circle-fill" color="#FF4D4F" top="2" size="32"></u-icon>
                <text>执行失败</text>
              </view>
            </view>
            <view class="flex card-bottom">
              <view class="secondary-txt">控制方式：{{ item.controlWayDesc }}</view>
              <view class="secondary-txt">{{ DayJS(item.startTime).format('HH:mm:ss') }}</view>
            </view>
          </view>
          <u-icon name="arrow-right" color="#00000073" top="4" size="40"></u-icon>
        </view>
      </view>
    </view>
  </template>
  <u-empty-custom v-else text="暂无数据" model="list" />
</template>

<style lang="scss" scoped>
.group {
  padding-top: 12px;
  .time {
    padding-left: 32rpx;
    padding-bottom: 16rpx;
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.65);
  }
  .card {
    padding: 32rpx;
    margin-bottom: 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    .record-main {
      flex: 1;
      .h2 {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 4rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 32rpx;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.88);
        .record-title {
          width: 400rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        :deep(.u-size-mini) {
          padding-left: 6rpx;
          padding-right: 0;
        }
      }
      .result {
        display: flex;
        align-items: center;
        gap: 6rpx;
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.65);
        .loading-icon {
          width: 32rpx;
          height: 32rpx;
          animation: 2s linear 0s infinite ring;
        }
      }
      .card-bottom {
        justify-content: space-between;
        margin-top: 8rpx;
      }
      .secondary-txt {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
}
.flex {
  display: flex;
  align-items: center;
  gap: 24rpx;
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
