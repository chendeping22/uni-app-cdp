<script setup lang="ts">
import { computed, ref } from 'vue';
import { Asset } from '../types/asset';
import AssetDetailPopup from './AssetDetailPopup.vue';
import AssetItem from './AssetItem.vue';

const props = defineProps<{
  list: Asset[];
}>();

const popupRef = ref();

const emit = defineEmits<{
  (e: 'delete', node: Asset): void;
}>();

const listIds = computed(() => (props.list || []).map(i => i.assetId || i.id));

const onClick = (_index: number) => {
  popupRef.value?.open(_index);
};

const onDelete = (node: Asset) => {
  emit('delete', node);
};
</script>

<template>
  <view v-if="list.length" class="asset-list">
    <asset-item
      v-for="(item, index) in list"
      :key="item.assetId || item.id"
      :node="item"
      inner
      hideAssetStatus
      @click="onClick(index)"
      @more="onDelete"
    >
      <template #left><view></view></template>
      <template #right>
        <text class="delete">删除</text>
      </template>
    </asset-item>
  </view>
  <asset-detail-popup ref="popupRef" :list-ids="listIds"></asset-detail-popup>
</template>

<style lang="scss" scoped>
.asset-list {
  background-color: #fff;
}
.delete {
  color: $ui-color-primary;
}
</style>
