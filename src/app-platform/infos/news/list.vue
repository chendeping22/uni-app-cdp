<script setup lang="ts">
import NewItem from '@/app-platform/infos/components/new-item/index.vue';
import { NewsItemData } from '@/app-platform/infos/types';

const props = defineProps<{
  data: NewsItemData[];
  onActions?: (data: NewsItemData) => void;
}>();
</script>

<template>
  <view class="list">
    <NewItem v-for="item in data" :key="item.id" :data="item" :on-actions="onActions" />
  </view>
</template>

<style lang="scss" scoped>
.list {
  padding: px2rpx(12) px2rpx(16) 0;
}
.content {
  width: 100%;
  height: 200px;
  background: #ccc;
  padding: 6px;
}
</style>
