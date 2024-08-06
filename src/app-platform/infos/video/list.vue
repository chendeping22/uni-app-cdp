<script setup lang="ts">
import VideoItem from '@/app-platform/infos/components/video-item/index.vue';
import { VideoItemData } from '@/app-platform/infos/types';

const props = defineProps<{
  data: VideoItemData[];
  onActions?: (data: VideoItemData) => void;
}>();
</script>

<template>
  <view class="list">
    <VideoItem v-for="item in data" :key="item.id" :data="item" :on-actions="onActions" />
  </view>
</template>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  padding: px2rpx(12) px2rpx(10) 0;
}
.content {
  width: 100%;
  height: 200px;
  background: #ccc;
  padding: 6px;
}
</style>
