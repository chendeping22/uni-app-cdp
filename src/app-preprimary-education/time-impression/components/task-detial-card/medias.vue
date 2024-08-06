<template>
  <view
    class="bg-white mt-s"
    :class="{
      'plr-b': model === 'edit',
    }"
  >
    <view
      :class="` ${
        model === 'detail' ? 'safety-education__medias' : 'safety-education__medias-mini'
      }`"
    >
      <view v-for="item in images" :key="item.url" class="box flex-center">
        <c-image
          :src="item.url"
          :preview="true"
          type="mini"
          :width="model === 'detail' ? '192rpx' : '96rpx'"
          :height="model === 'detail' ? '192rpx' : '96rpx'"
        />
        <view
          v-if="model !== 'edit' && model !== 'detail'"
          class="delete-icon"
          @click="handleDelete(item)"
        >
          <c-icon name="icon_close" :size="32"></c-icon>
        </view>
      </view>
    </view>

    <view v-for="item in videos" :key="item.url" class="text-center box mt-b">
      <!--#ifdef APP-PLUS -->
      <EmbeddedVideo
        :url="item.url"
        :size="{
          width: '610rpx',
          height: '311rpx',
        }"
      />
      <!--#endif -->
      <!--#ifdef MP-WEIXIN || H5 -->
      <video
        :src="item.url"
        :direction="0"
        initial-time="0"
        class="radius-default"
        :style="{
          width: '610rpx',
          height: '311rpx',
        }"
      />
      <!--#endif -->
      <view
        v-if="model !== 'edit' && model !== 'detail'"
        class="delete-icon delete-icon-video"
        @click="handleDelete(item)"
      >
        <c-icon name="icon_close" :size="32"></c-icon>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Media, SupportedMedia } from '../../utils/constants';
import EmbeddedVideo from './embedded-video.vue';

interface Props {
  medias: Media[];
  model: string; //edit or else
}

const props = defineProps<Props>();

const emits = defineEmits(['delete']);

const handleDelete = (item: Media) => {
  emits('delete', item);
};

const images = computed(() => props.medias.filter(m => m.kind === SupportedMedia.Image));

const videos = computed(() => props.medias.filter(m => m.kind === SupportedMedia.Video));

const model = computed(() => props.model);
</script>

<style scoped lang="scss">
.safety-education__medias {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 24rpx;
}

.safety-education__medias-mini {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-row-gap: 24rpx;
}

.box {
  position: relative;
}
.delete-icon {
  color: white;
  position: absolute;
  right: 0;
  top: -16rpx;
  background: red;
  border-radius: 32rpx;
  z-index: 2;
  &-video {
    right: 0rpx;
  }
}
</style>
