<template>
  <view>
    <u-card title="选择耗材" @click="handleSelect">
      <template #body>
        <view> data: {{ state.data }} </view>
      </template>
    </u-card>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import showSelector from './show-selector';

const state = reactive<any>({
  data: [],
});

const handleSelect = () => {
  showSelector({
    value: state.data,
    disabledIds: state.data.map((i: any) => i.id),
    // excludeIds: state.data.map((i: any) => i.id),
    callback: data => {
      state.data = data;
    },
  });
};
</script>
