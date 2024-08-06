<!-- 资产借用 -->
<template>
  <view class="page">
    <view v-if="detailData" class="main">
      <view class="head">
        <view class="head-top"
          ><view class="head-title">资产采购</view>
          <view
            v-if="!isNil(flowStatus) && pageParams?.type === '1'"
            :class="handleStatusStyle(flowStatus)"
            class="list-card-status"
            >{{ getStatusName(flowStatus) || '已完成' }}</view
          >
          <view v-else :class="handleStatusStyle(flowStatus)" class="list-card-status">{{
            detailData?.purchaseStatus === 1 ? '未采购' : '已采购'
          }}</view>
        </view>
        <view class="head-bottom">{{ detailData?.code }}</view>
      </view>
      <view class="detail-text">
        <!-- 已同意才显示 -->
        <template v-if="detailData?.applicationStatus === 1">
          <view class="main-item">
            <view class="main-item-title">采购人</view>
            <view class="main-item-content">{{
              detailData?.purchaseUserName ? detailData?.purchaseUserName : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">采购审批时间</view>
            <view class="main-item-content">{{
              detailData?.approveTime
                ? dayjs(detailData?.approveTime).format('YYYY-MM-DD HH:mm:ss')
                : '/'
            }}</view>
          </view></template
        >

        <view class="main-item">
          <view class="main-item-title">申请人</view>
          <view class="main-item-content">{{
            detailData?.applicationUserName ? detailData?.applicationUserName : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请部门</view>
          <view class="main-item-content">{{
            detailData?.deptName ? detailData?.deptName : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">申请日期</view>
          <view class="main-item-content">{{
            detailData?.applicationTime
              ? dayjs(detailData?.applicationTime).format('YYYY-MM-DD')
              : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">经费来源</view>
          <view class="main-item-content">{{
            detailData?.fundSourceStr ? detailData?.fundSourceStr : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">期望到货日期</view>
          <view class="main-item-content">{{
            detailData?.arrivalNoticeTime
              ? dayjs(detailData?.arrivalNoticeTime).format('YYYY-MM-DD')
              : '/'
          }}</view>
        </view>
        <view class="main-item">
          <view class="main-item-title">所属空间</view>
          <view class="main-item-content">{{
            detailData?.spaceName ? detailData?.spaceName : '/'
          }}</view>
        </view>
        <!-- 多行备注信息，显示3行折叠 -->
        <view class="main-item">
          <view class="main-item-title">摘要</view>
          <view class="main-item-content">{{
            detailData?.requestRemark ? detailData?.requestRemark : '/'
          }}</view>
        </view>
        <view v-if="detailData?.imagesList?.length > 0" class="upload-img">
          <view style="margin-bottom: 24rpx">图片</view>
          <view class="upload-img-wrap">
            <view
              v-for="(img, index) in detailData?.imagesList"
              :key="img.fileId"
              class="upload-img-item"
              @click="handleClickImgs(detailData?.imagesList, 'url', index)"
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
      <view v-if="detailData?.attachList?.length" class="upload-file">
        <view class="upload-file-head"><view>附件</view></view>
        <attachments-list
          field-file-name="name"
          field-file-url="url"
          :file-data="detailData?.attachList"
          :show-view-btn="false"
        />
      </view>
      <view v-if="detailData?.assetList?.length" class="assets-box">
        <view class="assets-head">采购明细</view>
        <view class="assets-wrap">
          <asset-list
            ref="assetListRef"
            :list="detailData.assetList"
            :readonly="pageParams?.type === '2' || detailData?.purchaseStatus !== 1"
            :popup-open="
              pageParams?.type === '1' &&
              detailData?.status === 1 &&
              detailData?.purchaseStatus === 1
            "
            :type="pageParams?.type"
            :purchase-status="detailData?.purchaseStatus"
            :application-status="detailData?.applicationStatus"
            @closePopup="closePopup"
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
    <detail-footer
      v-if="pageParams?.type === '1'"
      ref="detailFooterRef"
      :flow-status="flowStatus"
      :order-id="pageParams?.orderId"
      :detail-data="detailData"
      approval-type="purchases"
      @updateDetail="handleUpdate"
      @getAssetList="handleSubmit"
    />
  </view>
</template>

<script setup lang="ts">
import DetailFooter from '@/app-general-affairs-logistics/assets-manage/components/DetailFooter.vue';
import { statusList } from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import {
  handleClickImgs,
  handleStatusStyle,
} from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { onMounted, ref } from 'vue';
import { getAssetPurchasesDetails } from '../../services/purchase.ts';

import { showInfo } from '@/utils/tools';
import { getApprovalWorkOrderCommit } from '../../services/approve-operate';
import AssetList from './asset-list.vue';

// 采购明细列表
const assetListRef = ref();

const detailFooterRef = ref();

const detailData = ref<any>();
const pageParams = ref<{ orderId?: string; type?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const desc = ref<string>('');

const getStatusName = (status?: number | string) => {
  return statusList?.find(v => v?.value === status)?.label;
};

const getDetail = async () => {
  showLoading();
  getAssetPurchasesDetails(pageParams.value?.orderId || '')
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
  uni.setNavigationBarTitle({
    title: pageParams.value?.type === '1' ? '采购申请详情' : '采购清单详情',
  });
  getDetail();
});
const closePopup = () => {
  detailFooterRef.value.handleClose();
};
const handleSubmit = async params => {
  try {
    const list = await assetListRef.value.onSubmit();
    await getApprovalWorkOrderCommit({
      ...params,
      formData: { ...detailData.value, assetList: list },
    });
    showInfo('提交成功');
    closePopup();
    handleUpdate();
  } catch (error: any) {
    console.log('file: index.vue:164 ~ handleSubmit ~ error:', error);
  }
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
.list-card-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}
</style>
