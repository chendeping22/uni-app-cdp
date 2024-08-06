<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { levelEnum } from '@/app-teacher-personnel/topic/helper/enum';
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    required: true,
  },
});
const colors = ['default', 'red', 'orange', 'blue', 'purple', 'green'];
const tag = computed(() => {
  const text = levelEnum.find(l => l.value === props.level)?.label;
  return {
    text,
    color: colors[props.level],
  };
});
</script>
<template>
  <Tag :text="tag.text" :color="tag.color as any"></Tag>
</template>
<style lang="scss" scoped></style>
