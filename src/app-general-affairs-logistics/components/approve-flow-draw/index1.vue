<template>
  <view class="flow-draw">
    <view class="flow-draw-header">
      <view class="flow-draw-done"><text class="flow-notice">已完成</text></view>
      <view class="flow-draw-process"><text class="flow-notice">进行中</text></view>
      <view class="flow-draw-none"><text class="flow-notice">无/未处理</text></view>
    </view>
    <scroll-view scroll-y class="flow-scroll">
      <view class="flow-draw-content" v-if="flowData?.length">
        <view class="flow-draw-box" v-for="item in flowData" :key="item?.nodeCode">
          <view class="flow-draw-card" @click="handleNodeDetail(item)">
            <view class="flow-draw-card-header" :class="handleTypeStyle(item?.type)">{{
              handleNodeName(item)
            }}</view>
            <view class="flow-draw-card-body">{{ item?.userName }}</view>
          </view>
          <u-icon name="arrow-downward" color="rgba(0,0,0,0.15)" size="48"></u-icon>
        </view>
        <text class="flow-draw-end" v-if="showEnd">流程结束</text>
      </view>
      <view v-else class="empty-content"><u-empty-custom mode="list" /></view>
    </scroll-view>
    <flow-detail-popup ref="flowDetailRef" :orderId="pageParams?.orderId" />
  </view>
</template>

<script setup lang="ts">
import { getPageParams } from '@/utils/tools';
import { filter } from 'lodash-es';
import { computed, onMounted, reactive, ref } from 'vue';
import flowDetailPopup from './flow-detail-popup/index.vue';
import { fetchWorkInfoId, fetchWorkOrderInfo } from './services';

interface IFlowNode {
  nodeCode: string;
  nodeType: string;
  nodeName: string;
  type: string;
  userName: string;
  [x: string]: any;
}

const flowDetailRef = ref();

const isLoading = ref<boolean>(false);

const state = reactive<{ flowList: IFlowNode[] }>({
  flowList: [],
});

const pageParams = ref<any>();

/** 除结束外的流程节点 */
const flowData = computed(() => filter(state.flowList, v => v.nodeType !== 'endround'));

/** 是否展示流程结束 */
const showEnd = computed(() => state.flowList?.find(v => v.nodeType === 'endround'));

/** 流程节点弹窗 */
const handleNodeDetail = (item: IFlowNode) => {
  flowDetailRef.value.handleShowPopup(item?.nodeCode || '');
};

const handleNodeName = (node: IFlowNode) => {
  if (node.nodeType === 'start') {
    return '流程发起';
  }
  return node.nodeName;
};

/** 获取流程图数据 */
const getWorkInfoId = async () => {
  try {
    isLoading.value = true;
    uni.showLoading();
    const res: any = await fetchWorkInfoId(pageParams.value?.orderId, pageParams.value?.type);
    if (res?.flowId && res?.taskNodeId && res?.taskOperatorId) {
      const detailRes: any = await fetchWorkOrderInfo(pageParams.value?.orderId, res);
      state.flowList = detailRes?.flowTaskNodeList;
    }
  } finally {
    isLoading.value = false;
    uni.hideLoading();
  }
};

const handleTypeStyle = (type: string) => {
  let val = 'color-unFinish-bg';
  switch (type) {
    case '0': // 已完成
      val = 'color-success-bg';
      break;
    case '1': // 进行中
      val = 'color-primary-bg';
      break;
    default:
      break;
  }
  return val;
};

onMounted(() => {
  pageParams.value = getPageParams();
  if (!pageParams?.value?.orderId) return;
  getWorkInfoId();
});
</script>

<style lang="scss" scoped>
@import './style.scss';
.flow-draw {
  padding: 24rpx 32rpx;
  .flow-draw-header {
    display: flex;
    justify-items: center;
    margin-bottom: 24rpx;
    .flow-draw-done,
    .flow-draw-process,
    .flow-draw-none {
      display: flex;
      align-items: center;
      margin-right: 32rpx;
    }
    .flow-draw-done {
      &::before {
        content: '';
        width: 24rpx;
        height: 24rpx;
        background-color: $colorSuccessBase;
        position: absolute;
        border-radius: 50%;
      }
    }
    .flow-draw-process {
      &::before {
        content: '';
        width: 24rpx;
        height: 24rpx;
        background-color: $colorPrimaryBase;
        position: absolute;
        border-radius: 50%;
      }
    }
    .flow-draw-none {
      &::before {
        content: '';
        width: 24rpx;
        height: 24rpx;
        background-color: $colorFillBase;
        position: absolute;
        border-radius: 50%;
      }
    }
    .flow-notice {
      margin-left: 30rpx;
    }
  }
  .flow-draw-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    .flow-draw-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16rpx;
    }
    .flow-draw-card {
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
      margin-bottom: 16rpx;
      border-radius: 16rpx;
      width: 500rpx;
      &-header {
        font-size: 30rpx;
        color: #ffffff;
        padding: 16rpx 24rpx;
        border-top-right-radius: 16rpx;
        border-top-left-radius: 16rpx;
      }
      &-body {
        padding: 16rpx 24rpx;
        border-bottom-left-radius: 16rpx;
        border-bottom-right-radius: 16rpx;
        background: rgba(255, 255, 255, 1);
        font-size: 30rpx;
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
  .flow-draw-end {
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.65);
    padding: 32rpx;
    background-color: $colorFillBase;
    border-radius: 64rpx;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  }
}

.empty-content {
  height: calc(100vh - 200rpx);
  display: flex;
  justify-content: center;
  align-items: center;
}
.flow-scroll {
  height: calc(100vh - 220rpx - env(safe-area-inset-bottom));
  height: calc(100vh - 220rpx - constant(safe-area-inset-bottom));
}
</style>
