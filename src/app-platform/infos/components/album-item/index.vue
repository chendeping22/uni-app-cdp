<script setup lang="ts">
import CustomImage from '@/app-platform/infos/components/custom-image/index.vue';
import TagStatus from '@/app-platform/infos/components/tag-status/index.vue';
import { AlbumItemData } from '@/app-platform/infos/types';
import { EnumStatusMap, LOG_STATUS, formatTagModes } from '@/app-platform/infos/util';
import moreWhite from '@/app-platform/static/infos/more-white.svg';
import { computed } from 'vue';

const props = defineProps<{ data: AlbumItemData; onActions?: (data: AlbumItemData) => void }>();

const tagModes = computed(() => formatTagModes(props.data) as EnumStatusMap[]);

const handleActionClick = () => {
  if (props.onActions && typeof props.onActions === 'function') {
    props.onActions(props.data);
  }
};

const click2Detail = () => {
  const detail = props.data;
  if (detail) {
    if (detail.publishStatus === LOG_STATUS.verifying) {
      uni.showToast({
        title: '班级相册信息校验中',
        icon: 'none',
      });
      return;
    }

    uni.navigateTo({
      url: `/app-platform/infos/album/detail?id=${detail.id}`,
    });
  }
};
</script>

<template>
  <view class="album-item gap u-relative" @click="click2Detail">
    <view class="u-absolute album-item-tag">
      <TagStatus v-if="tagModes.length" :mode="tagModes[0]" />
    </view>
    <CustomImage
      :src="data.thumbnailFileUrl || data.fileUrl"
      :width="330"
      :height="330"
      :resource-type="1"
      :border-radius="0"
    />
    <view class="u-line-1 u-absolute pos">
      <view class="album-item-title u-line-2">{{ data.title }}</view>
      <view class="album-item-label u-line-1">{{ data.spacesName }}</view>
      <view class="album-item-dot u-absolute" @click.stop="handleActionClick">
        <u-image :src="moreWhite" :show-loading="false" :fade="false" :width="40" :height="40" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.album-item {
  &.gap {
    overflow: hidden;
    width: px2rpx(165px);
    height: px2rpx(165px);
    margin: 0 px2rpx(6) px2rpx(12);
    background: $color-text-inverse;
    border-radius: $radius-base;
    box-shadow: $shadow-light-down-base;
  }

  .pos {
    bottom: 0;
    left: 0;
    width: 100%;
    padding: $space-size-ms $space-size-md $space-size-s;
    max-height: px2rpx(70px);
    background: linear-gradient(
      0.31deg,
      rgba($color-text-base, 0.7) 0.38%,
      rgba($color-text-base, 0) 99.85%
    );
    color: $color-text-inverse;
  }

  &-tag {
    left: $space-size-base;
    top: $space-size-base;
    z-index: 1;
  }

  &-title {
    @include footnote-regular;
    box-sizing: content-box;
    overflow-wrap: break-word;
    word-wrap: break-word;
    white-space: normal;
  }

  &-label {
    @include caption-2-regular;
  }

  &-dot {
    right: 0;
    bottom: $space-size-s;
  }
}
</style>
