<script setup lang="ts">
import AlbumItem from '@/app-platform/infos/components/album-item/index.vue';
import { AlbumItemData } from '@/app-platform/infos/types';

const props = defineProps<{
  data: AlbumItemData[];
  onActions?: (data: AlbumItemData) => void;
}>();
</script>

<template>
  <view class="list">
    <AlbumItem v-for="item in data" :key="item.id" :data="item" :on-actions="onActions" />
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
