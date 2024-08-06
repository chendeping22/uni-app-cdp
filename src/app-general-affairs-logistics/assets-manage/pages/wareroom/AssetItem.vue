<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import StatusTag from '../../components/detail/assets-info/status-tag.vue';
import { AssetStatusEnum, type Asset } from '../../types/asset';
import icon_avatar from '/static/avatar.png';

const props = defineProps<{
  node: Asset;
  userId?: string;
}>();

const onClick = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/detail/index?id=${props.node.id}`,
  });
};

const showRecipient = computed(() => {
  if ([AssetStatusEnum.IN_USE, AssetStatusEnum.BORROWED].includes(+props.node.assetStatus)) {
    return props.node.recipientId && props.node.recipientId !== props.userId;
  }
  return false;
});
</script>

<template>
  <view class="asset-item" @click="onClick">
    <view class="asset-item-name-tag">
      <text class="asset-item-name">{{ node.assetName }}</text>
      <StatusTag :status="node.assetStatus" :label="node.assetStatusShow" style="flex: none" />
    </view>
    <view class="asset-item-content">
      <view v-if="node.assetInfoImgVOList[0]?.fileUrl" class="asset-item-icon">
        <image class="icon-img" :src="node.assetInfoImgVOList[0].fileUrl" mode="aspectFit" />
      </view>
      <view v-else class="asset-item-icon icon-default">
        <u-icon name="photo" color="#999" size="68"></u-icon>
      </view>
      <view class="asset-item-main">
        <view class="asset-item-desc">
          <text class="asset-item-desc-label">编号</text>
          <text class="asset-item-desc-value">{{ node.assetNo }}</text>
        </view>
        <view class="asset-item-desc">
          <text class="asset-item-desc-label">品牌</text>
          <text class="asset-item-desc-value">{{ node.brand || '/' }}</text>
        </view>
        <view class="asset-item-desc">
          <text class="asset-item-desc-label">型号</text>
          <text class="asset-item-desc-value">{{ node.assetModel || '/' }}</text>
        </view>
        <view class="asset-item-desc">
          <text class="asset-item-desc-label">入库</text>
          <text class="asset-item-desc-value">{{
            node.arrivalDate ? dayjs(node.arrivalDate).format('YYYY-MM-DD HH:mm') : '/'
          }}</text>
        </view>
      </view>
    </view>
    <view v-if="showRecipient" class="asset-item-recipient">
      <u-avatar size="48" :src="node.recipientHeadImg || icon_avatar"></u-avatar>
      <view class="asset-item-recipient-name">
        {{ node.recipientName || '/' }}
      </view>
      <view class="asset-item-recipient-space"> 所在空间：{{ node.spaceName || '/' }} </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.asset-item {
  display: flex;
  flex-direction: column;
  margin: 24rpx 32rpx;
  background-color: #fff;
  box-shadow: 0px 1px 2px 0px #0000000a;
  border-radius: 16rpx;
  &-content {
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 0 32rpx 32rpx;
  }
  &-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: 40rpx;
    overflow: hidden;
  }
  &-desc {
    margin-bottom: 16rpx;
  }
  &-name-tag {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
    padding: 32rpx 32rpx 0;
  }
  &-name {
    // flex: 1;
    font-size: 32rpx;
    font-weight: 500;
    max-width: 100%;
    margin-right: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-desc {
    display: flex;
    font-size: 30rpx;
    line-height: 40rpx;
    &-label {
      color: #999;
    }
    &-value {
      flex: 1;
      margin-left: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 208rpx;
    height: 208rpx;
    border-radius: 16rpx;
    margin-right: 32rpx;
    overflow: hidden;
    &.icon-default {
      background-color: #f2f2f2;
    }
  }

  &-recipient {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    border-top: 1px solid #0000000f;
    &-name {
      font-size: 30rpx;
      max-width: 40%;
      margin-left: 16rpx;
    }
    &-space {
      flex: 1;
      font-size: 26rpx;
      margin-left: 16rpx;
      color: #999;
      text-align: right;
    }
    &-name,
    &-space {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .icon-img {
    width: 100%;
    height: 100%;
  }
}
</style>
