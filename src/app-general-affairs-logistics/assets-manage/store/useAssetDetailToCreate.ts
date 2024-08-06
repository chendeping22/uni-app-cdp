import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAssetDetailToCreate = defineStore('assetDetailToCreate', () => {
  // 缓存信息
  const assetInfo = ref<Record<string, any>>({});

  const $set = (data: Record<string, any>) => {
    assetInfo.value = data || {};
  };

  // 提交
  const $reset = () => {
    assetInfo.value = {};
  };

  return {
    assetInfo,
    $set,
    $reset,
  };
});
