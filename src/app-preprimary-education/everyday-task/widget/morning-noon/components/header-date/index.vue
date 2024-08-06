<template>
  <c-header
    :title="`${today} ${weekName}`"
    title-size-type="content"
    title-color-type="placeholder"
  />
</template>
<script lang="ts">
import { formatDate } from '@/utils/tools';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  setup() {
    const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const now = new Date();
    const today = formatDate(now);
    const weekName = weeks[now.getDay()];

    return { today, weekName };
  },
});
</script>
<style scoped lang="scss"></style>
