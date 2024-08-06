<script setup lang="ts">
import filter from '@/app-general-affairs-logistics/static/consumable-management/filter.svg';
import topImg from '@/app-general-affairs-logistics/static/consumable-management/top.svg';
import { computed, reactive } from 'vue';
const props = defineProps({
  listData: {
    /** 卡片数据 */
    type: Array,
    default: () => [],
  },
  total: {
    /** 卡片数据 */
    type: Number,
    default: 0,
  },
  pageNum: {
    /** 卡片数据 */
    type: Number,
    default: 1,
  },
  pageStatus: {
    /** 卡片数据 */
    type: String,
    default: 'loadmore',
  },
  scrollTop: {
    /** 卡片数据 */
    type: Number,
    default: 1,
  },
  bottomText: {
    type: String,
    default: '',
  },
  bottomUrl: {
    type: String,
    default: '',
  },
});
const emit = defineEmits<{
  (e: 'filter'): void;
}>();
const isEmpty = computed(
  () => state.pageStatus !== 'loading' && state.pageNum === 1 && state.listData?.length === 0,
);
const state = reactive<{
  listData: Record<string, any>[];
  pageNum: number;
  total: number;
  pageStatus: string;
}>({
  listData: [],
  pageNum: 1,
  total: 0,
  pageStatus: 'loadmore',
});
const goAdd = () => {
  uni.navigateTo({ url: props.bottomUrl });
};
</script>
<template>
  <view class="list-wrap">
    <view class="total-filter">
      <view class="total-filter-title">共{{ total }}条记录</view>
      <u-image
        :src="filter"
        width="40rpx"
        height="40rpx"
        :fade="false"
        :show-loading="false"
        :style="{ marginLeft: '32rpx' }"
        @click="emit('filter')"
      ></u-image>
    </view>
    <view v-if="listData?.length" class="list">
      <slot></slot>
      <u-loadmore :status="pageStatus" margin-bottom="32" />
    </view>
    <view v-else class="list-empty">
      <u-empty-custom v-if="isEmpty" mode="list"></u-empty-custom>
    </view>
    <u-back-top :custom-style="{ width: '96rpx', height: '96rpx' }" :scroll-top="scrollTop">
      <view class="back-top">
        <u-image
          :src="topImg"
          width="48rpx"
          height="48rpx"
          :fade="false"
          :show-loading="false"
        ></u-image>
      </view>
    </u-back-top>
    <view v-if="bottomText" class="list-bottom">
      <u-button type="primary" @click="goAdd">{{ bottomText }}</u-button>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </view>
</template>
<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.list-wrap {
  padding-top: 24rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  &-title {
    color: #000000a6;
    font-family: 'PingFang SC';
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
  }
  .list {
    padding: 0 32rpx;
    flex: 1;
  }
}
.list-empty {
  flex: 1;
}
.total-filter {
  height: 80rpx;
  padding: 20rpx 32rpx;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}
.back-top {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  border: 1rpx solid #0000000f;
  background: #fff;
  box-shadow: 0 8rpx 16rpx 0 #00000029;
}
.list-bottom {
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;
  z-index: 2;
  background-color: $colorWhite;
}
</style>
