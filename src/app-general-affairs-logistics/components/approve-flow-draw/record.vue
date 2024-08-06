<template>
  <ProcessList v-if="!!workOrderId" :id="workOrderId"></ProcessList>
</template>
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import ProcessList from '../FlowProcessViewer/ProcessList.vue';

const workOrderId = ref('');

onLoad((options: any) => {
  if (options.id) {
    workOrderId.value = options.id;
  }
});
</script>
