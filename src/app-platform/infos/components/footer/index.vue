<script setup lang="ts">
import { footList } from '@/app-platform/infos/util';
import { color_primary } from '@/styles/get-variables';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
}>();
const emits = defineEmits(['update:modelValue']);

const current = ref(props.modelValue);

const list: (Record<'iconPath' | 'selectedIconPath' | 'text', any> &
  Partial<Record<'midButton' | 'customIcon', any>>)[] = footList;

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
  <view class="footer u-relative">
    <u-tabbar v-model="current" :list="list" :active-color="color_primary" @change="change" />
  </view>
</template>

<style lang="scss" scoped>
.footer {
  box-shadow: $shadow-light-up-md;
  z-index: 1;
  height: 100%;
}
</style>
