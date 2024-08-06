<template>
  <imp-space v-if="medias.length > 0" :wrap="wrap" :class-name="className" :gap-size="gapSize">
    <view
      v-for="(m, inx) in medias"
      :key="`media_${t}_${inx}`"
      :class="`image-wrap flex-center image-item-${size} mr-${gapSize === 'xs' ? 'xs' : 'b'} mb-${
        gapSize === 'xs' ? 'xs' : 'b'
      }`"
    >
      <view v-if="editable" class="delete-wrap" @click="handleDelete(inx)">
        <uni-icons type="clear" size="18" color="#f55753"></uni-icons>
      </view>
      <image
        v-if="m.type === 1"
        :src="transformImageUrl(m.url)"
        :class="`image-item-${size}`"
        @click="handlePreview(inx)"
      />
      <img
        v-else
        :class="[`image-item-${size}`, 'flex-center radius-default bg-deep']"
        :src="m.videoSnapshotUrl || ''"
        @click="handleClickDetail(m.url)"
      />
      <view
        style="z-index: 1"
        v-if="m.type === 2"
        :class="[`image-item-${size}`, 'absolute flex-center radius-default']"
        @click="handleClickDetail(m.url)"
      >
        <view
          :class="`icon-${size === 'large' ? '64' : '48'} radius-round flex-center`"
          :style="{
            background: 'rgba(0, 0, 0, 0.64)',
          }"
        >
          <c-image
            :src="icon_play_white"
            :width="size === 'large' ? 48 : 36"
            :height="size === 'large' ? 48 : 36"
          />
        </view>
      </view>
    </view>
  </imp-space>
</template>
<script lang="ts">
import { icon_play_white } from '@/app-preprimary-education/clock-in/utils/icon-play-white';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { IMedia } from '@/app-preprimary-education/services/clock-in';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { defineComponent, PropType, ref } from 'vue';
/** 仅展示媒体组件, 新增入口另外设计 */
export default defineComponent({
  components: { ImpSpace },
  props: {
    medias: {
      type: Array as PropType<IMedia[]>,
      default: () => [],
    },
    wrap: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: false,
    },
    gapSize: {
      type: String as PropType<'xs' | 'default'>,
      default: 'xs',
    },
    size: {
      type: String as PropType<'large' | 'small'>,
      default: 'large',
    },
  },
  emits: ['onDelete', 'videoData'],
  setup(props, emits) {
    const t = ref(Date.now());
    const handleDelete = (inx: number) => {
      emits.emit('onDelete', inx);
    };
    const handlePreview = (inx: number) => {
      const fileId = props.medias[inx].fileId;
      const images = (props.medias.filter(m => m.type === 1) || []).map(m => {
        m.url = transformImageUrl(m.url);
        return m;
      });
      uni.previewImage({
        urls: images.map(i => i.url),
        current: images.findIndex(i => i.fileId === fileId),
      });
    };
    const handleClickDetail = (data: any) => {
      emits.emit('videoData', data);
    };
    return {
      t,
      transformImageUrl,
      handleDelete,
      handlePreview,
      icon_play_white,
      handleClickDetail,
    };
  },
});
</script>
<style lang="scss" scoped>
.image-wrap {
  position: relative;
  .delete-wrap {
    position: absolute;
    top: -18rpx;
    right: -18rpx;
    width: 36rpx;
    height: 36rpx;
    z-index: 1;
  }
}
.image-item-large {
  width: calc((100vw - 144rpx) / 3 - 1px);
  height: calc((100vw - 144rpx) / 3 - 1px);
  border-radius: $ui-radius-small;
}
.image-item-small {
  width: 96rpx;
  height: 96rpx;
  border-radius: $ui-radius-small;
}
</style>
