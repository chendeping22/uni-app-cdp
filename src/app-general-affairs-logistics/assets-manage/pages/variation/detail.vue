<template>
  <view class="page">
    <view v-if="detailData" class="main">
      <view class="head">
        <view class="head-top"
          ><view class="head-title">资产变更</view>
          <status-tag :status="flowStatus" />
        </view>
        <view class="head-bottom">{{ detailData?.code }}</view>
      </view>
      <view class="detail-text">
        <view class="main-item" v-for="(item, index) in infoData" :key="index">
          <view class="main-item-title">{{ item.label }}</view>
          <view class="main-item-content">{{ item?.value || '/' }}</view>
        </view>
      </view>
      <asset-detail-list :assetList="detailData?.changeItemList" />
      <approve-flow
        ref="approveFlowRef"
        :order-id="pageParams?.orderId"
        :type="TypeEnum.AssetManager"
      />
    </view>
    <u-empty-custom v-else mode="data" :text="desc"></u-empty-custom>
    <detail-footer
      :flow-status="flowStatus"
      :order-id="pageParams?.orderId"
      :detail-data="detailData"
      @updateDetail="handleUpdate"
      @onResubmit="resubmit"
    />
  </view>
</template>

<script setup lang="ts">
import AssetDetailList from '@/app-general-affairs-logistics/assets-manage/components/AssetDetailList.vue';
import DetailFooter from '@/app-general-affairs-logistics/assets-manage/components/DetailFooter.vue';
import StatusTag from '@/app-general-affairs-logistics/assets-manage/components/StatusTag.vue';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import { getAssetChangeDetails } from '../../services/variation.ts';

const detailData = ref<any>();
const pageParams = ref<{ orderId?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const desc = ref<string>('');
const infoData = ref<any[]>();

const handleInfo = (res?: Record<string, any>) => {
  infoData.value = [
    {
      label: '申请人',
      value: res?.applyUserName,
    },
    {
      label: '申请部门',
      value: res?.departmentName,
    },
    {
      label: '申请日期',
      value: res?.applyTime ? dayjs(res?.applyTime).format('YYYY-MM-DD') : '/',
    },
    {
      label: '变更方式',
      value: res?.methodDesc,
    },
    {
      label: '变更空间',
      value: res?.spaceName,
    },
    {
      label: '变更位置',
      value: res?.place,
    },
    {
      label: '变更原因',
      value: res?.reason,
    },
    {
      label: '变更内容',
      value: res?.content,
    },
  ];
};

const getDetail = async () => {
  if (!pageParams.value?.orderId) return;
  showLoading();
  getAssetChangeDetails(pageParams.value?.orderId || '')
    .then((res: any) => {
      detailData.value = res;
      flowStatus.value = res?.status;
      handleInfo(res);
    })
    .catch((error: any) => {
      if (error?.msg) desc.value = error?.msg;
    })
    .finally(() => {
      hideLoading();
    });
};

const handleUpdate = () => {
  getDetail();
  approveFlowRef.value?.getFlowTaskNodeHandleInfo();
};

onMounted(() => {
  const params = getPageParams();
  pageParams.value = params || {};
  getDetail();
});

const resubmit = () => {
  uni.redirectTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/variation/index?id=${detailData.value?.id}`,
  });
};
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.page {
  height: calc(100% - env(safe-area-inset-bottom));
  height: calc(100% - constant(safe-area-inset-bottom));
  overflow: auto;
}
.head {
  display: flex;
  padding: 24rpx 32rpx;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  background: #fff;
  border-radius: 16rpx;
}
.head-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.head-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 36rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 52rpx;
}
.head-bottom {
  color: rgba(0, 0, 0, 0.45);
  font-family: 'PingFang SC';
  font-size: 24rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 36rpx;
}

.main {
  padding: 24rpx 32rpx;
  overflow: auto;
}
.detail-text {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.main-item {
  display: flex;
  margin-bottom: 16rpx;
  .main-item-title {
    color: rgba(0, 0, 0, 0.65);
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
    margin-right: 24rpx;
    white-space: nowrap;
  }
  .main-item-content {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.88);
    text-overflow: ellipsis;
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
  }
}
</style>
