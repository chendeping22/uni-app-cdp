<script setup lang="ts">
import AssetDetailList from '@/app-general-affairs-logistics/assets-manage/components/AssetDetailList.vue';
import DetailFooter from '@/app-general-affairs-logistics/assets-manage/components/DetailFooter.vue';
import StatusTag from '@/app-general-affairs-logistics/assets-manage/components/StatusTag.vue';
import { getAssetBorrowDetail } from '@/app-general-affairs-logistics/assets-manage/services/borrow';
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
  getAssetBorrowDetail(pageParams.value?.orderId || '')
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

const resubmit = () => {
  uni.redirectTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/borrow/index?id=${detailData.value.id}`,
  });
};
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
          ><view class="head-title">资产借用</view>
          <StatusTag :status="detailData?.status"></StatusTag> </view
        ><view class="head-bottom">{{ detailData?.code }}</view>
      </view>
      <view class="detail-text">
        <view class="main-item">
          <view class="main-item-title">借用日期</view>
          <view class="main-item-content">{{
            dayjs(detailData?.borrowDate).format('YYYY-MM-DD')
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">借用人</view>
          <view class="main-item-content">{{ detailData?.borrowUserName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">借用部门</view>
          <view class="main-item-content">{{ detailData?.deptName }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">预计归还日期</view>
          <view class="main-item-content">{{
            detailData?.preBackTime ? dayjs(detailData?.preBackTime).format('YYYY-MM-DD') : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">借用后所在空间</view>
          <view class="main-item-content">{{
            detailData?.spaceName ? detailData?.spaceName : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">借用后存放位置</view>
          <view class="main-item-content">{{
            detailData?.placeAfterBorrow ? detailData?.placeAfterBorrow : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">借用备注</view>
          <view class="main-item-content">{{
            detailData?.assertUsage ? detailData?.assertUsage : '/'
          }}</view>
        </view>
        <view v-if="detailData?.imgList.length > 0" class="upload-img">
          <view style="margin-bottom: 24rpx">图片</view>
          <view class="upload-img-wrap">
            <view
              v-for="(img, index) in detailData?.imgList"
              :key="img.fileId"
              class="upload-img-item"
              @click="handleClickImgs(detailData?.imgList, 'fileUrl', index)"
            >
              <u-image
                :src="img.fileUrl"
                width="142"
                height="142"
                border-radius="16"
                mode="aspectFill"
              >
              </u-image
            ></view>
          </view>
        </view>
      </view>
      <view v-if="detailData?.fileList.length" class="upload-file">
        <view class="upload-file-head"><view>附件</view> </view>
        <attachments-list :file-data="detailData?.fileList" :show-view-btn="false" />
      </view>
      <asset-detail-list :assetList="detailData?.itemDTOList" />
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
      @onResubmit="resubmit"
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
