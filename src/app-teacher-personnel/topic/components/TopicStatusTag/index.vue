<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { topicStatusEnum } from '@/app-teacher-personnel/topic/helper/enum';
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: Number,
    required: true,
  },
});
const colors = ['status_default', 'status_blue', 'status_green', 'status_red'];
const tag = computed(() => {
  const text = topicStatusEnum.find(l => l.value === props.status)?.label;
  return {
    text,
    color: colors[props.status],
  };
});
</script>
<template>
  <Tag :text="tag.text" :color="tag.color as any"></Tag>
</template>
<style lang="scss" scoped></style>
