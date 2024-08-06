<template>
  <u-card title="chart circle">
    <template #body>
      <chart-circle
        :data="[10, 20, 30, 20, 10]"
        :color="['#963', '#693', '#396', '#369', '#639']"
      ></chart-circle>
    </template>
  </u-card>
  <u-card title="chart circle">
    <template #body>
      <chart-circle :width="150" :height="150" :data="data">
        <text>插槽内容</text>
      </chart-circle>
    </template>
  </u-card>
  <u-card title="chart circle">
    <template #body>
      <chart-circle
        :data="[
          { value: 10, color: 'red' },
          { value: 20, color: 'blue' },
          { value: 30, color: 'yellow' },
          { value: 20, color: 'orange' },
          { value: 10, color: 'green' },
        ]"
      ></chart-circle>
    </template>
  </u-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import ChartCircle from './circle.vue';

const data = ref([30, 20, 30, 30, 20]);

onMounted(() => {
  setTimeout(() => {
    data.value = [10, 20, 30, 10, 20];
  }, 3000);
});
</script>
