<script setup lang="ts">
import AssetDetailList from '@/app-general-affairs-logistics/assets-manage/components/AssetDetailList.vue';
import DetailFooter from '@/app-general-affairs-logistics/assets-manage/components/DetailFooter.vue';
import StatusTag from '@/app-general-affairs-logistics/assets-manage/components/StatusTag.vue';
import { getAssetAssetRepairsDetail } from '@/app-general-affairs-logistics/assets-manage/services/repair';
import { urgencyList } from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { handleClickImgs } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, ref } from 'vue';
import { StatusEnum } from '../../utils/constants';

const detailData = ref<any>();
const pageParams = ref<{ orderId?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const desc = ref<string>('');
const getDetail = async () => {
  showLoading();
  getAssetAssetRepairsDetail(pageParams.value?.orderId || '')
    .then(res => {
      detailData.value = res;
      flowStatus.value = res?.status;
    })
    .catch(error => {
      if (error?.msg) desc.value = error?.msg;
    })
    .finally(() => {
      uni.stopPullDownRefresh();
      hideLoading();
    });
};

const getUrgency = (status?: number | string) => {
  return urgencyList?.find(v => v?.value === status).label;
};

const handleUpdate = () => {
  getDetail();
  approveFlowRef.value?.getFlowTaskNodeHandleInfo();
};
onBeforeMount(() => {
  const params = getPageParams();
  pageParams.value = params || {};
  getDetail();
});
onPullDownRefresh(() => {
  getDetail();
});
const resubmit = () => {
  uni.redirectTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/repair/index?id=${detailData.value.id}`,
  });
};
</script>
<template>
  <page custom-overflow="visible">
    <view
      v-if="detailData"
      class="main"
      :class="detailData?.status === StatusEnum.Approve ? 'btn-main ' : 'no-btn-main'"
    >
      <view class="head">
        <view class="head-top"
          ><view class="head-title">资产报修</view>
          <StatusTag :status="detailData?.status"></StatusTag> </view
        ><view class="head-bottom">{{ detailData?.applyCode }}</view>
      </view>
      <view class="detail-text">
        <view class="main-item">
          <view class="main-item-title">申请日期</view>
          <view class="main-item-content">{{
            dayjs(detailData?.applyTime).format('YYYY-MM-DD')
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请人</view>
          <view class="main-item-content">{{ detailData?.applyUserName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请部门</view>
          <view class="main-item-content">{{ detailData?.departmentName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">紧急程度</view>
          <view class="main-item-content">{{ getUrgency(detailData?.urgency) }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">期望完成维修日期</view>
          <view class="main-item-content">{{
            detailData?.hopeTime ? dayjs(detailData?.hopeTime).format('YYYY-MM-DD') : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">故障描述</view>
          <view class="main-item-content">{{
            detailData?.faultDesc ? detailData?.faultDesc : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">预算金额（元）</view>
          <view class="main-item-content">{{
            detailData?.expectAmount ? detailData?.expectAmount : '/'
          }}</view>
        </view>
        <view v-if="detailData?.imagesList.length > 0" class="upload-img">
          <view style="margin-bottom: 24rpx">图片</view>
          <view class="upload-img-wrap">
            <view
              v-for="(img, index) in detailData?.imagesList"
              :key="img.fileId"
              class="upload-img-item"
              @click="handleClickImgs(detailData?.imagesList, 'url', index)"
            >
              <u-image :src="img.url" width="142" height="142" border-radius="16" mode="aspectFill">
              </u-image
            ></view>
          </view>
        </view>
      </view>
      <view v-if="detailData?.attachList.length" class="upload-file">
        <view class="upload-file-head"><view>附件</view></view>
        <attachments-list
          :file-data="detailData?.attachList"
          :show-view-btn="false"
          field-file-name="name"
          field-file-url="url"
        />
      </view>
      <asset-detail-list :assetList="detailData?.assetList" />
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
  </page>
</template>
<style lang="scss" scoped>
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
  gap: 16rpx;
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
.footer {
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  height: 128rpx;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
}
.footer-nav {
  display: flex;
}
.main {
  padding: 24rpx 32rpx;
  overflow: auto;
}

// .btn-main {
//   // #ifdef H5
//   height: calc(100vh - 216rpx);
//   // #endif
//   // #ifdef APP-PLUS || MP-WEIXIN
//   height: calc(100vh - 128rpx);
//   // #endif
// }
// .no-btn-main {
//   // #ifdef H5
//   height: calc(100vh - 88rpx);
//   // #endif
//   // #ifdef APP-PLUS || MP-WEIXIN
//   height: calc(100vh);
//   // #endif
// }
.detail-text {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.main-item {
  display: flex;
  gap: 24rpx;
  .main-item-title {
    color: rgba(0, 0, 0, 0.65);
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
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
.upload-img {
  margin-top: 32rpx;

  .upload-img-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
}
.upload-file {
  padding: 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}

.upload-file-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx 0;
  align-items: center;
}
</style>
