<script setup lang="ts">
import { mapList } from '@/app-platform/infos/util';
import { computed, ref, watch } from 'vue';

const props = defineProps<{ modelValue: number; depValue: number }>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'update:depValue', value: number): void;
}>();

const current = ref(props.modelValue);
const list = computed(() => mapList[props.depValue]);

function change(index: number) {
  current.value = index;
  emits('update:modelValue', index);
}

watch(
  () => props.depValue,
  newDep => {
    emits('update:depValue', newDep);
  },
);

watch(
  () => props.modelValue,
  newCurrent => {
    current.value = newCurrent;
  },
);
</script>

<template>
  <view class="header u-relative">
    <u-tabs
      v-model="current"
      height="88"
      :list="list"
      :is-scroll="false"
      :bar-style="{ bottom: `-4rpx` }"
      @change="change"
    />
  </view>
</template>

<style lang="scss" scoped>
.header {
  box-shadow: $shadow-light-down-md;
  z-index: 1;
}
</style>
