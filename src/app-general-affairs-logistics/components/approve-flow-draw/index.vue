<template>
  <FlowProcessViewer v-if="!!workOrderId" :id="workOrderId"></FlowProcessViewer>
</template>
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import FlowProcessViewer from '../FlowProcessViewer/index.vue';

const workOrderId = ref('');

onLoad((options: any) => {
  if (options.orderId) {
    workOrderId.value = options.orderId;
  }
});
</script>
