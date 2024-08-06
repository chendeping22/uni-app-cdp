<template>
  <view :style="{ height: `${statusBarHeight}px`, width: '100%' }"> </view>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  setup() {
    const statusBar = uni.getSystemInfoSync().statusBarHeight ?? 0;
    const statusBarHeight = ref(statusBar || 0);
    return { statusBarHeight };
  },
});
</script>
<style scoped lang="scss"></style>
