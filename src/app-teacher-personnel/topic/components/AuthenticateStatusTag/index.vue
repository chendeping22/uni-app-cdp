<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { authenticateStatusEnum } from '@/app-teacher-personnel/topic/helper/enum';
import { computed } from 'vue';

const props = defineProps({
  authenticateStatus: {
    type: Number,
    required: true,
  },
});
const tag = computed(() => {
  const findOne = authenticateStatusEnum.find(l => l.value == props.authenticateStatus);
  return {
    text: findOne?.label || '',
    color: findOne?.color,
  };
});
</script>
<template>
  <Tag :text="tag.text" :color="tag.color as any" text-only></Tag>
</template>
<style lang="scss" scoped></style>
