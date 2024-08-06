<template>
  <view class="page">
    <view v-if="detailData" class="main">
      <view class="head">
        <view class="head-top"
          ><view class="head-title">资产处置</view>
          <status-tag :status="flowStatus" :type="RecordTypeEnum.DisposeRecord" /> </view
        ><view class="head-bottom">{{ detailData?.code }}</view>
      </view>
      <view class="detail-text">
        <view class="main-item">
          <view class="main-item-title">处置日期</view>
          <view class="main-item-content">{{
            detailData?.disposalTime ? dayjs(detailData?.disposalTime).format('YYYY-MM-DD') : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">处置操作人</view>
          <view class="main-item-content">{{ detailData?.disposalUserName || '/' }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">处置类型</view>
          <view class="main-item-content">{{ detailData?.disposalTypeName || '/' }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">处置金额(元)</view>
          <view class="main-item-content">{{ detailData?.disposalAmount || '/' }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">处置备注</view>
          <view class="main-item-content">{{ detailData?.assertUsage || '/' }}</view>
        </view>
        <view v-if="detailData?.images?.length > 0" class="upload-img">
          <view style="margin-bottom: 24rpx">图片</view>
          <view class="upload-img-wrap">
            <view
              v-for="(img, index) in detailData?.images"
              :key="img.fileId"
              class="upload-img-item"
              @click="handleClickImgs(detailData?.images, 'url', index)"
            >
              <u-image
                :src="img?.url"
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
      <view v-if="detailData?.attach?.length" class="upload-file">
        <view class="upload-file-head"><view>附件</view></view>
        <attachments-list
          :file-data="detailData?.attach"
          :show-view-btn="false"
          field-file-name="name"
          field-file-url="url"
        />
      </view>
      <asset-detail-list :asset-list="detailData?.assetItemList" />
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
import { RecordTypeEnum } from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { handleClickImgs } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import { getAssetDisposalsDetails } from '../../services/dispose';

const detailData = ref<any>();
const pageParams = ref<{ orderId?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const desc = ref<string>('');

const getDetail = async () => {
  showLoading();
  getAssetDisposalsDetails(pageParams.value?.orderId || '')
    .then((res: any) => {
      detailData.value = res;
      flowStatus.value = res?.status;
    })
    .catch(error => {
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
    url: `/app-general-affairs-logistics/assets-manage/pages/dispose/index?id=${detailData.value?.id}`,
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
.upload-img {
  margin-top: 32rpx;

  .upload-img-wrap {
    display: flex;
    flex-wrap: wrap;
    margin-right: -16rpx;
    margin-bottom: -16rpx;
  }
  .upload-img-item {
    margin-right: 16rpx;
    margin-bottom: 16rpx;
  }
}
.assets-box {
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
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
  font-size: 32rpx;
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
.list-card-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}
</style>
