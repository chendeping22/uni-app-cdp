<script setup lang="ts">
import CustomImage from '@/app-platform/infos/components/custom-image/index.vue';
import { IInfoInfo, IInfoType, ReviewStatus } from '@/app-platform/services/infos';

import { formatDate } from '@/utils/tools';

const props = defineProps<{ index: number; info: IInfoInfo }>();
const emits = defineEmits(['clickItem']);
const clickItemAction = () => {
  emits('clickItem');
};
</script>

<template>
  <view class="review-item gap" @click="clickItemAction">
    <view class="review-item-warp">
      <view class="u-flex u-row-between review-item-desc u-m-b-12">
        <text>{{ info.typeName }}</text>
        <text>{{
          formatDate(
            info.reviewStatus === ReviewStatus.waiting ? info.createTime : info.reviewTime,
            'YYYY-MM-DD hh:mm',
          )
        }}</text>
      </view>
      <view class="u-flex u-col-between">
        <view class="review-item-r">
          <view class="review-item-title u-line-2">
            <text> {{ info.title }} </text>
          </view>
        </view>
        <CustomImage
          :src="info.fileUrl"
          :width="160"
          :height="106"
          :resource-type="info.type === IInfoType.video ? 2 : 1"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.review-item {
  &.gap {
    padding: $space-size-ms $space-size-md 0;
  }

  &-desc {
    @include footnote-regular;
    color: rgba($color-text-base, 0.45);
  }

  &-title {
    height: px2rpx(44px);
    @include callout-regular;
    overflow: hidden;
  }

  &-warp {
    background: $color-background-base;
    border-radius: $radius-base;
    overflow: hidden;
    padding: $space-size-ms $space-size-md;
    box-shadow: $shadow-light-down-base;

    align-items: flex-start;
  }

  &-r {
    padding-right: $space-size-ms;
    flex: 1;

    &-txt {
      @include caption-1-regular;
      display: flex;
    }
  }

  &-thumb {
    width: px2rpx(80px);
    height: px2rpx(53px);
    border-radius: $radius-sm;
    overflow: hidden;
    position: relative;
  }
}
</style>
