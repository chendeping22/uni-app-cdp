<template>
  <view
    v-if="workbench.widgets && workbench.widgets.length > 0"
    :key="workbench.widgets?.length"
    class="container"
  >
    <template v-for="(widget, current) in workbench.widgets" :key="current">
      <widgetItem :widget="widget"></widgetItem>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { workbenchStore } from '@/store/modules/workbench';
import { toRefs } from 'vue';
import widgetItem from './widget-item.vue';

/** 3. your code here! */
const store = workbenchStore();
const { workbench } = toRefs(store);
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
}
</style>
