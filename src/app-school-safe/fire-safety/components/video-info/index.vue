<template>
  <view :class="['common-card components-monitor-info fire-video']">
    <video
      v-if="videoUrl"
      :key="'fire-video'"
      class="video-image"
      :src="videoUrl"
      :show-progress="false"
    />
    <view v-else class="video-image fire-video">
      <c-empty content="该设备未关联摄像头" top="0" />
    </view>
  </view>
</template>
<script lang="ts" setup>
interface IProps {
  videoUrl?: string;
}

withDefaults(defineProps<IProps>(), {
  videoUrl: '',
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.components-monitor-info {
  height: 520rpx;

  .video-image {
    display: flex;
    flex-direction: column;
    width: 622rpx;
    height: 360rpx;
    margin-bottom: $ui-gap-default;
    border-radius: $ui-radius-xl;
    position: relative;
  }
}

.fire-video {
  height: 420rpx;

  .video-image {
    height: 360rpx;
  }
}
</style>
