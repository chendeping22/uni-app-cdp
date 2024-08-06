<template>
  <u-popup
    v-model="open"
    mode="bottom"
    closeable
    safe-area-inset-bottom
    border-radius="8"
    @close="close"
  >
    <view class="asset-supplier-detail">
      <view class="asset-supplier-detail-title headline-regular"> 采购供应商详情 </view>
      <view class="asset-supplier-detail-content">
        <view class="asset-supplier-title subheadline-medium">{{ name }} </view>
        <view class="asset-supplier-code footnote-regular"> {{ code }}</view>
        <view class="asset-supplier-phone u-flex">
          <u-image width="32rpx" height="32rpx" :src="phoneFiled"></u-image>
          <text class="footnote-regular" style="padding-left: 16rpx">{{ tel ? tel : '/' }}</text>
        </view>
        <view class="asset-supplier-address">
          <u-icon name="map" color="#8C8C8C" size="32"></u-icon>
          <text class="footnote-regular" style="padding-left: 16rpx; word-break: break-word">
            {{ address ? address : '/' }}</text
          >
        </view>
        <view class="asset-supplier-note"> 备注：{{ remark ? remark : '/' }} </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import phoneFiled from '@/app-general-affairs-logistics/static/assets-manage/phone_filed.svg';
import { computed } from 'vue';

const props = defineProps<{
  show?: boolean;
  name?: string;
  code?: string;
  tel?: string;
  address?: string;
  remark?: string;
}>();
const open = computed(() => props.show);
const emits = defineEmits(['close']);
const close = () => {
  emits('close');
};
</script>
<style lang="scss" scoped>
.asset-supplier {
  &-detail-title {
    line-height: 96rpx;
    text-align: center;
  }
  &-detail-content {
    padding: 24rpx 32rpx;
  }
  &-phone {
    margin-top: 24rpx;
    margin-bottom: 16rpx;
  }
  &-address {
    display: flex;
    align-items: first baseline;
  }
  &-note {
    margin-top: 24rpx;
    word-break: break-all;
  }
}
</style>
