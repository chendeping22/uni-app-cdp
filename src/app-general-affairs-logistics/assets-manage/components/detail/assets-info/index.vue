<template>
  <view>
    <u-card
      :show-head="false"
      :show-foot="false"
      :border="false"
      margin="24rpx 32rpx 0 32rpx"
      class="assets-card"
      ><template #body>
        <view class="assets-header u-flex u-col-top">
          <image
            v-if="fileImgList?.[0]"
            :src="fileImgList?.[0]"
            class="header-img"
            mode="aspectFit"
            @click="handleClickImgs(fileImgList)"
          ></image>
          <view v-else class="header-img icon-default">
            <u-icon name="photo" color="#999" size="38"></u-icon>
          </view>
          <view class="u-flex-1">
            <view class="u-flex u-col-top u-row-between u-margin-bottom-16">
              <view class="device-name u-flex-1">{{ detailData?.assetName || '/' }}</view>
              <StatusTag :status="detailData?.assetStatus" :label="detailData?.assetStatusShow" />
            </view>
            <view class="u-flex">
              <text class="text-secondary u-margin-right-24">编号</text>
              <text class="text-default">{{ detailData?.assetNo || '/' }}</text>
            </view>
          </view>
        </view>
        <view
          v-if="detailData?.recipientName && props?.detailInfo?.isAdmin"
          class="u-flex user-box"
        >
          <u-avatar size="80" :src="detailData?.recipientHeadImgUrl || icon_avatar"></u-avatar>
          <view class="u-flex u-row-between u-flex-1 u-margin-left-32">
            <view>
              <view class="text-default u-font-16">{{ detailData?.recipientName }}</view>
              <view class="text-secondary u-font-13 u-margin-top-8">{{
                detailData?.defaultBelongName
              }}</view>
            </view>
            <view class="text-secondary u-font-13 final-date">{{ finalDateVal }}</view>
          </view>
        </view>
      </template></u-card
    >
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { filter, map } from 'lodash-es';
import { PropType, computed } from 'vue';
import { IDetailData } from '../constants';
import StatusTag from './status-tag.vue';
import icon_avatar from '/static/avatar.png';

const props = defineProps({
  detailInfo: {
    type: Object as PropType<IDetailData>,
    default: {},
  },
  noPreview: {
    type: Boolean,
    default: false,
  },
});

const detailData = computed(() => props?.detailInfo?.baseInfoMap);

const finalDateVal = computed(() =>
  detailData.value?.finalDate ? dayjs(detailData.value?.finalDate).format('YYYY-MM-DD') : '',
);

const fileImgList = computed(() => {
  const imgs = props?.detailInfo?.assetInfoImgVOList || [];
  const filterData = imgs && imgs?.length ? filter(imgs, v => v?.fileUrl) : [];
  return map(filterData, (i: Record<string, string>) => i?.fileUrl || '');
});

const handleClickImgs = (val?: any[]) => {
  if (props.noPreview) {
    return;
  }
  if (val?.length) {
    uni.previewImage({
      urls: val,
      current: 0,
    });
  }
};
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.assets-card {
  border-radius: 16rpx;
}
.assets-header {
  .header-img {
    height: 112rpx;
    width: 112rpx;
    margin-right: 32rpx;
    border-radius: 8rpx;
    overflow: hidden;
    &.icon-default {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f2f2f2;
    }
  }
  .device-name {
    font-size: 34rpx;
    font-weight: 500;
    color: $textDefaultColor;
    margin-right: 24rpx;
  }
}
.final-date {
  min-width: 140rpx;
  margin-left: 16rpx;
}
.user-box {
  border-top: 1px solid $borderColor;
  padding-top: 24rpx;
  margin-top: 32rpx;
}
</style>
