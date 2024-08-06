<script setup lang="ts">
import { color_primary } from '@/styles/get-variables';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
  list: (Record<'iconPath' | 'selectedIconPath' | 'text', any> &
    Partial<Record<'midButton' | 'customIcon', any>>)[];
}>();
const emits = defineEmits(['update:modelValue']);

const current = ref(props.modelValue);

function change(index: number) {
  current.value = index;
  emits('update:modelValue', index);
}

watch(
  () => props.modelValue,
  newCurrent => {
    current.value = newCurrent;
  },
);
</script>

<template>
  <u-tabbar v-model="current" :list="list" :active-color="color_primary" @change="change" />
  <!-- <view class="footer-placeholder" /> -->
</template>

<style lang="scss" scoped>
// .footer-placeholder {
//   padding-top: calc(112rpx + constant(safe-area-inset-bottom));
//   padding-top: calc(112rpx + env(safe-area-inset-bottom));
// }
</style>
