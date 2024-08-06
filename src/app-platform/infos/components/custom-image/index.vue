<template>
  <view
    class="thumb u-flex u-row-center"
    :style="{ width: width + 'rpx', height: height + 'rpx', borderRadius: borderRadius + 'rpx' }"
  >
    <u-image :src="src" :width="width" :height="height" :fade="false" @error="errorAction">
      <template #loading>
        <u-loading />
      </template>
    </u-image>
    <u-image
      v-if="!imgLoadErrorStatus && resourceType === 2"
      class="video"
      :src="video"
      width="40"
      height="40"
      :show-loading="false"
      :fade="false"
    />
    <view v-if="imgLoadErrorStatus || !src" class="error">
      <u-image
        :src="resourceType === 2 ? errorVideo : errorImage"
        :width="resourceType === 2 ? 47 : 48"
        :height="resourceType === 2 ? 36 : 48"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import errorImage from '@/app-platform/static/infos/error-image.svg';
import errorVideo from '@/app-platform/static/infos/error-video.svg';
import video from '@/app-platform/static/infos/video.svg';
import { ref } from 'vue';

/** 1. props定义 */
interface IProps {
  src: string;
  // 宽度，单位rpx
  width: number;
  // 高度，单位rpx
  height: number;
  // 资源类型 图片1 视频2
  resourceType: number;
  // 圆角
  borderRadius?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  src: '',
  width: 0,
  height: 0,
  resourceType: 1,
  borderRadius: 8,
});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits([]);

/** 3. your code here! */
const imgLoadErrorStatus = ref<boolean>(false);
const errorAction = () => {
  imgLoadErrorStatus.value = true;
};
</script>

<style scoped lang="scss">
.thumb {
  position: relative;
  border-radius: $radius-sm;
  overflow: hidden;

  .video {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .error {
    background-color: #f0f0f0;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
