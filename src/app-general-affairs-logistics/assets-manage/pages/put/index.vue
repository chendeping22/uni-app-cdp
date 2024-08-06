<script setup lang="ts">
import DetailFooter from '@/app-general-affairs-logistics/assets-manage/components/DetailFooter.vue';
import StatusTag from '@/app-general-affairs-logistics/assets-manage/components/StatusTag.vue';
import { getAssetPutDetails } from '@/app-general-affairs-logistics/assets-manage/services/put';
import { handleClickImgs } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, ref } from 'vue';
import { StatusEnum } from '../../utils/constants';
import AssetList from '../purchaseRequestetail/asset-list.vue';

const detailData = ref<any>();
const pageParams = ref<{ orderId?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const desc = ref<string>('');

const getDetail = async () => {
  showLoading();
  getAssetPutDetails(pageParams.value?.orderId || '')
    .then(res => {
      detailData.value = res;
      flowStatus.value = res?.status;
    })
    .catch(error => {
      if (error?.msg) desc.value = error?.msg;
    })
    .finally(() => {
      hideLoading();
      uni.stopPullDownRefresh();
    });
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
</script>
<!-- 资产借用 -->
<template>
  <page custom-overflow="visible">
    <view
      v-if="detailData"
      class="main"
      :class="detailData?.status === StatusEnum.Approve ? 'btn-main' : 'no-btn-main'"
    >
      <view class="head">
        <view class="head-top"
          ><view class="head-title">资产入库</view>
          <StatusTag :status="detailData?.status"></StatusTag> </view
        ><view class="head-bottom">{{ detailData?.code }}</view>
      </view>
      <view class="detail-text">
        <view class="main-item">
          <view class="main-item-title">申请日期</view>
          <view class="main-item-content">{{
            dayjs(detailData?.applyDate).format('YYYY-MM-DD')
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请人</view>
          <view class="main-item-content">{{ detailData?.applyUserName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请部门</view>
          <view class="main-item-content">{{ detailData?.deptName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">经费来源</view>
          <view class="main-item-content">{{
            detailData?.fundSourceDesc ? detailData?.fundSourceDesc : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">入库空间</view>
          <view class="main-item-content">{{
            detailData?.spaceName ? detailData?.spaceName : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">摘要</view>
          <view class="main-item-content">{{ detailData?.remark ? detailData?.remark : '/' }}</view>
        </view>
        <view v-if="detailData?.imgList.length > 0" class="upload-img">
          <view style="margin-bottom: 24rpx">图片</view>
          <view class="upload-img-wrap">
            <view
              v-for="(img, index) in detailData?.imgList"
              :key="img.fileId"
              class="upload-img-item"
              @click="handleClickImgs(detailData?.imgList, 'url', index)"
            >
              <u-image :src="img.url" width="142" height="142" border-radius="16" mode="aspectFill">
              </u-image
            ></view>
          </view>
        </view>
      </view>
      <view v-if="detailData?.fileList.length" class="upload-file">
        <view class="upload-file-head"><view>附件</view></view>
        <attachments-list
          field-file-name="name"
          field-file-url="url"
          :file-data="detailData?.fileList"
          :show-view-btn="false"
        />
      </view>
      <view v-if="detailData?.assetPutItems.length" class="assets-box">
        <view class="assets-head"> 资产明细（{{ detailData?.assetPutItems.length }}）</view>
        <view class="assets-wrap">
          <asset-list
            ref="assetListRef"
            :list="detailData?.assetPutItems"
            :readonly="true"
            :popup-open="false"
            :type="2"
          ></asset-list>
        </view>
      </view>
      <approve-flow
        ref="approveFlowRef"
        :order-id="pageParams?.orderId"
        :type="TypeEnum.AssetManager"
      />
    </view>
    <u-empty-custom v-else mode="data" :text="desc"></u-empty-custom>
    <DetailFooter
      :flow-status="flowStatus"
      :order-id="pageParams?.orderId"
      :detail-data="detailData"
      @updateDetail="handleUpdate"
      approvalType="putIn"
    />
  </page>
</template>
<style lang="scss" scoped>
.page {
  position: relative;
  overflow: auto;
  // #ifdef H5
  height: calc(100vh - 88rpx);
  // #endif
  // #ifdef APP-PLUS || MP-WEIXIN
  height: 100vh;
  // #endif
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
.assets-box {
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}
.upload-file,
.tool-wrap {
  padding: 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}

.tool-wrap-head {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  display: flex;
  gap: 16rpx;
}
.upload-file-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx 0;
  align-items: center;
}
.file-list {
  overflow: hidden;
  padding-right: 24rpx;
}
.file-item {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 24rpx 32rpx;
}
.file-item-icon {
  height: 48rpx;
  width: 48rpx;
  display: block;
}
.file-item-name {
  margin: 0 32rpx 0 36rpx;
  flex: 1;
  color: rgba(0, 0, 0, 0.88);
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.assets-wrap {
  padding: 0 32rpx;
}
.assets-head {
  padding: 24rpx 32rpx;
  color: rgba(0, 0, 0, 0.88);
  font-family: 'PingFang SC';
  font-size: 32rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 44rpx;
}
.assets-item {
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(245, 245, 245, 1);
  }
}
.assets-content {
  flex: 1;
  margin-left: 32rpx;
  margin-right: 16rpx;
  .assets-content-name {
    color: rgba(0, 0, 0, 0.88);
    font-family: 'PingFang SC';
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
  }
  .assets-content-no {
    color: rgba(0, 0, 0, 0.45);
    font-family: 'PingFang SC';
    font-size: 24rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 36rpx;
  }
}
</style>
