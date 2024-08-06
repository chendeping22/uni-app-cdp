<template>
  <page>
    <slot name="pages"></slot>
    <u-tabbar
      v-model="tabbarIndex"
      inactive-color="rgba(0, 0, 0, 0.65)"
      :list="props.tabbarList"
      active-color="#1677FF"
      style="z-index: 0; position: relative"
    ></u-tabbar>
  </page>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, defineProps, ref, watch } from 'vue';

const props = defineProps({
  tabbarList: [],
});

const tabbarIndex = ref(0);

const tabKey = computed({
  get() {
    return props.tabbarList[tabbarIndex.value]?.key;
  },
  set(val: string) {
    let index = props.tabbarList.findIndex(t => t.key === val);
    if (index < 0) {
      index = 0;
    }
    tabbarIndex.value = index;
  },
});

watch(
  () => tabbarIndex.value,
  newVal => {
    uni.setNavigationBarTitle({
      title: props.tabbarList[newVal].text,
    });
  },
);

onLoad(() => {
  uni.setNavigationBarTitle({
    title: props.tabbarList[tabbarIndex.value].text,
  });
});

// 生命周期事件
defineExpose({
  tabKey,
});
</script>
