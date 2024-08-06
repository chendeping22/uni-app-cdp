<script setup lang="ts">
import CustomImage from '@/app-platform/infos/components/custom-image/index.vue';
import TagStatus from '@/app-platform/infos/components/tag-status/index.vue';
import { VideoItemData } from '@/app-platform/infos/types';
import { EnumStatusMap, LOG_STATUS, formatTagModes } from '@/app-platform/infos/util';
import moreGrey from '@/app-platform/static/infos/more-grey.svg';
import { computed } from 'vue';

const props = defineProps<{ data: VideoItemData; onActions?: (data: VideoItemData) => void }>();

const tagModes = computed(() => formatTagModes(props.data) as EnumStatusMap[]);

const handleActionClick = () => {
  if (props.onActions && typeof props.onActions === 'function') {
    props.onActions(props.data);
  }
};

const handleItemClick = () => {
  const detail = props.data;
  if (detail) {
    if (detail.publishStatus === LOG_STATUS.verifying) {
      uni.showToast({
        title: '班级视频信息校验中',
        icon: 'none',
      });
      return;
    }

    uni.navigateTo({
      url: `/app-platform/infos/video/detail?id=${detail.id || ''}`,
    });
  }
};
</script>

<template>
  <view class="video-item gap u-relative" @click="handleItemClick">
    <view class="u-absolute video-item-tag">
      <TagStatus v-if="tagModes.length" :mode="tagModes[0]" />
    </view>
    <view class="video-item-img">
      <CustomImage
        :src="data.thumbnailFileUrl || data.fileUrl"
        :width="330"
        :height="186"
        :resource-type="2"
        :border-radius="0"
      />
    </view>

    <view class="u-line-2 video-item-title">{{ data.title }}</view>
    <view class="u-flex u-row-between u-relative u-p-l-32">
      <view class="u-line-1 video-item-label">{{ data.spacesName }}</view>
      <view class="video-item-dot" @click.stop="handleActionClick">
        <u-image :src="moreGrey" :show-loading="false" :fade="false" :width="40" :height="40" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.video-item {
  &.gap {
    overflow: hidden;
    width: px2rpx(165px);
    height: px2rpx(173px);
    margin: 0 px2rpx(6) px2rpx(12);
    background: $color-text-inverse;
    border-radius: $radius-base;
    box-shadow: $shadow-light-down-base;
  }

  &-title {
    @include footnote-regular;
    padding: $space-size-ms $space-size-md 0;
    box-sizing: content-box;
    height: px2rpx(36px);
    color: rgba($color-text-base, 0.88);
    line-height: px2rpx(18px);
  }

  &-img {
    width: px2rpx(165px);
    height: px2rpx(93px);
  }

  &-label {
    color: rgba($color-text-base, 0.45);
    @include caption-2-regular;
  }

  &-tag {
    left: $space-size-base;
    top: $space-size-base;
    z-index: 1;
  }
}
</style>
