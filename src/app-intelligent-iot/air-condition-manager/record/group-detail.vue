<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import DayJS from 'dayjs';
import { reactive, ref } from 'vue';
import { loadDeviceLog, loadMemberLog } from '../../services/air-condition';
import type { TGroupRecord } from '../type';

type TDevice = {
  id: string;
  deviceName: string;
  status: number;
  failCode?: string;
}

const logId = ref('');
const refreshState = ref(false);
const groupRecord = ref<TGroupRecord>({} as TGroupRecord);
const deviceList = reactive<{ array: TDevice[] }>({ array: [] });

const init = async (id: string) => {
  const params = {
    pageNum: 1,
    pageSize: 99,
    memberRecordId: id,
  };
  // 主记录
  loadMemberLog({ id, pageNum: 1, pageSize: 1 }).then(res => {
    const { result } = res as { result: TGroupRecord[] };
    if (result?.length) {
      groupRecord.value = result[0];
    }
  })
  try {
    // 设备明细记录
    const lodDetail = await loadDeviceLog(params);
    const { result } = lodDetail as { result: TDevice[] };
    deviceList.array = result;
    refreshState.value = false;
  } catch (e) {
    refreshState.value = false;
  }
};

const onRefresh = () => {
  refreshState.value = true;
  init(logId.value);
};

onLoad((option: any) => {
  const { id } = option;
  if (id) {
    logId.value = id;
    init(id);
  }
});
</script>

<template>
  <scroll-view
    :scroll-y="true"
    class="container"
    refresher-background="transparent"
    refresher-enabled="true"
    :refresher-triggered="refreshState"
    @refresherrefresh="onRefresh"
  >
    <view class="card">
      <view class="header">
        <template v-if="groupRecord.status === 1">
          <u-icon name="checkmark-circle-fill" color="#52C41A" top="4" size="120"></u-icon>
          <text class="result">执行成功</text>
        </template>
        <template v-if="groupRecord.status === -1">
          <image class="loading-icon" src="@/app-intelligent-iot/static/image/icon_loading2.png"></image>
          <text class="result">执行中</text>
        </template>
        <template v-if="groupRecord.status === 0">
          <u-icon name="close-circle-fill" color="#FF4D4F" top="4" size="120"></u-icon>
          <text class="result">执行失败</text>
        </template>
        <view class="secondary-txt">
          操作人：{{ groupRecord.createName || '/' }}&nbsp;
          {{ groupRecord.startTime ? DayJS(groupRecord.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </view>
      </view>
      <view class="ul pt-xl">
        <view class="li" v-for="item in deviceList.array">
          <u-icon v-if="item.status === 1" name="checkmark-circle-fill" color="#52C41A" top="8" size="40"></u-icon>
          <image v-if="item.status === -1" class="loading-icon" style="width: 40rpx; height: 40rpx;" src="@/app-intelligent-iot/static/image/icon_loading2.png"></image>
          <u-icon v-if="item.status === 0" name="close-circle-fill" color="#FF4D4F" top="2" size="40"></u-icon>
          <view class="pull-right">
            <view class="item">
              <text class="item-name">{{ item.deviceName || '/' }}</text>
              <text v-if="item.status === 1" class="item-result">执行成功</text>
              <text v-if="item.status === -1" class="item-result">执行中...</text>
              <text v-if="item.status === 0" class="item-result">执行失败</text>
            </view>
            <view v-if="item.status === 0" class="err-msg">失败原因：{{ item.failCode || '/' }}</view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 88rpx);
  padding: 24rpx 32rpx;
  .card {
    padding: 48rpx 32rpx;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    .loading-icon {
      width: 120rpx;
      height: 120rpx;
      animation: 2s linear 0s infinite ring;
    }
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
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
      gap: 24rpx;
      .li {
        display: flex;
        align-items: flex-start;
        gap: 16rpx;
        .pull-right {
          flex: 1;
          .item {
            display: flex;
            align-items: center;
            gap: 16rpx;
            &-name {
              flex: 1;
              font-size: 32rpx;
              color: rgba(0, 0, 0, 0.88);
            }
            &-result {
              font-size: 32rpx;
              color: rgba(0, 0, 0, 0.65);
            }
          }
          .err-msg {
            margin-top: 8rpx;
            padding: 8rpx 24rpx;
            border-radius: 8rpx;
            line-height: 36rpx;
            font-size: 26rpx;
            color: rgba(0, 0, 0, 0.88);
            background-color: rgba(0, 0, 0, 0.06);
          }
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