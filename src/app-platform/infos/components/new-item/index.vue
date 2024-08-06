<script setup lang="ts">
import CustomImage from '@/app-platform/infos/components/custom-image/index.vue';
import TagStatus from '@/app-platform/infos/components/tag-status/index.vue';
import { NewsItemData } from '@/app-platform/infos/types';
import { EnumStatusMap, LOG_STATUS, formatTagModes } from '@/app-platform/infos/util';
import moreSvg from '@/app-platform/static/infos/more.svg';
import { filter } from '@/utils/lodash-es';
import { formatDate } from '@/utils/tools';
import { computed } from 'vue';

const props = defineProps<{ data: NewsItemData; onActions?: (data: NewsItemData) => void }>();

const tagModes = computed(() => formatTagModes(props.data, true) as EnumStatusMap[]);
const topTag = computed(() => {
  if (tagModes.value.includes(EnumStatusMap.top)) {
    return EnumStatusMap.top;
  }

  if (tagModes.value.includes(EnumStatusMap.down)) {
    return EnumStatusMap.down;
  }

  if (tagModes.value.includes(EnumStatusMap.verifying)) {
    return EnumStatusMap.verifying;
  }

  if (tagModes.value.includes(EnumStatusMap.verify_fail)) {
    return EnumStatusMap.verify_fail;
  }

  return false;
});
const timerTag = computed(() => tagModes.value.includes(EnumStatusMap.timer));

//-- 审核中 定时 -->
const bottomTag = computed<any>(() => {
  if (tagModes.value.length) {
    return (
      filter(tagModes.value, tag => ![EnumStatusMap.top, EnumStatusMap.down].includes(tag))[0] ??
      false
    );
  }
  return false;
});

const dateFormat = data => {
  // 若未到达定时发布时间，发布时间取定时发布时间，并显示文案【定时】， 若已过定时发布时间，发布时间取审核通过时间
  if (timerTag.value && !data.publishTime) {
    return formatDate(data.scheduledReleaseTime, 'YYYY-MM-DD hh:mm');
  }
  return formatDate(data.publishTime || data.updateTime || data.createTime, 'YYYY-MM-DD hh:mm');
};

const handleActionClick = () => {
  if (props.onActions && typeof props.onActions === 'function') {
    props.onActions(props.data);
  }
};

const clickToDetail = () => {
  const detail = props.data;
  if (detail) {
    if (detail.publishStatus === LOG_STATUS.verifying) {
      uni.showToast({
        title: '资讯信息校验中',
        icon: 'none',
      });
      return;
    }

    uni.navigateTo({
      url: `/app-platform/infos/news/detail?id=${detail.id}`,
    });
  }
};

const textIndentMap = {
  [EnumStatusMap.review]: 122,
  [EnumStatusMap.verifying]: 122,
  [EnumStatusMap.verify_fail]: 144,
  [EnumStatusMap.top]: 72,
  [EnumStatusMap.timer]: 72,
  [EnumStatusMap.down]: 94,
};
</script>

<template>
  <view class="new-item gap" @click="clickToDetail">
    <view class="u-flex u-col-between new-item-warp">
      <view class="new-item-r u-flex-1">
        <view calss="u-relative">
          <view class="u-absolute">
            <TagStatus v-if="topTag" :mode="topTag" />
          </view>
          <view
            class="new-item-title u-line-2"
            :style="{ textIndent: `${topTag ? textIndentMap[topTag] : 0}rpx` }"
          >
            {{ data.title }}
          </view>
        </view>
        <view class="u-flex u-row-between new-item-bottom">
          <view class="u-line-2 new-item-r new-item-r-txt">
            <TagStatus v-if="bottomTag" :mode="bottomTag" />
            <text v-if="bottomTag !== 'review'" class="caption-1-regular">
              {{ dateFormat(data) }}
            </text>
          </view>
          <view class="new-item-r-dot" @click.stop="handleActionClick">
            <u-image :src="moreSvg" :show-loading="false" :fade="false" width="40" height="40" />
          </view>
        </view>
      </view>
      <view class="new-item-thumb u-flex u-row-center">
        <CustomImage
          :src="data.thumbnailFileUrl || data.fileUrl"
          :width="208"
          :height="140"
          :resource-type="1"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.new-item {
  &.gap {
    margin-bottom: px2rpx(12);
  }

  &-title {
    height: px2rpx(44px);
    line-height: px2rpx(22px);
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
    align-items: center;

    &-txt {
      display: flex;
      color: $color-text-description;
      @include caption-1-regular;
    }

    &-dot {
      width: px2rpx(20px);
      height: px2rpx(20px);
    }
  }

  .new-tag {
    background: $error-bg;
    padding: $space-size-s;
    border-radius: $radius-sm;
    line-height: px2rpx(16px);
  }

  &-thumb {
    width: px2rpx(104px);
    height: px2rpx(70px);
    margin-left: px2rpx(12);
    border-radius: $radius-sm;
    overflow: hidden;
  }

  &-bottom {
    margin-top: $space-size-ms;
  }
}
</style>
