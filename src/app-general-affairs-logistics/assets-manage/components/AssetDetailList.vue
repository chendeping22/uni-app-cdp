<template>
  <view v-if="props.assetList?.length" class="assets-box">
    <view class="assets-head"> 资产明细（{{ props.assetList?.length }}）</view>
    <view class="assets-wrap">
      <view
        v-for="item in assetList"
        :key="item?.assetId"
        class="assets-item"
        @click="handleToAssetDetail(item?.assetId)"
      >
        <view>
          <u-image
            width="80rpx"
            height="80rpx"
            border-radius="8rpx"
            :src="
              item?.[props.imgListName]?.[0] ? item?.[props.imgListName]?.[0]?.fileUrl : defaultFile
            "
          ></u-image>
        </view>
        <view class="assets-content">
          <view class="assets-content-name">{{ item?.assetName }}</view>
          <view class="assets-content-no">{{ item?.assetNo }}</view>
        </view>
        <view>
          <u-icon name="arrow-right" color="rgba(0, 0, 0, 0.45)"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { handleToAssetDetail } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import defaultFile from '@/app-general-affairs-logistics/static/assets-manage/upload-file-item.svg';

const props = defineProps({
  // 详情
  assetList: {
    type: Object,
    default: {},
  },
  // 图片列表名称
  imgListName: {
    type: String,
    default: 'assetInfoImgVOList',
  },
});
</script>

<style lang="scss" scoped>
.assets-box {
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
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
  width: 100%;
  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(245, 245, 245, 1);
  }
}
.assets-content {
  flex: 1;
  margin-left: 32rpx;
  margin-right: 16rpx;
  width: calc(100% - 156rpx);
  .assets-content-name {
    color: rgba(0, 0, 0, 0.88);
    font-family: 'PingFang SC';
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
