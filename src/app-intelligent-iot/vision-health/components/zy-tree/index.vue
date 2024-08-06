<template>
  <view class="">
    <tree-item
      v-for="(item, index) in list"
      :key="index"
      :item="item"
      :detect-option="detectOption"
      :show-border="index < list.length - 1"
    />
  </view>
</template>

<script setup>
import treeItem from './item.vue';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  detectOption: {
    type: Object,
    default: () => {},
  },
});
</script>
