<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { declareStatusEnum } from '@/app-teacher-personnel/topic/helper/enum';
import { computed } from 'vue';

const props = defineProps({
  declareStatus: {
    type: Number,
    required: true,
  },
});
const tag = computed(() => {
  const findOne = declareStatusEnum.find(l => l.value == props.declareStatus);
  return {
    text: findOne?.label || '',
    color: findOne?.color,
  };
});
</script>
<template>
  <Tag :text="tag.text" :color="tag.color as any"></Tag>
</template>
<style lang="scss" scoped></style>
