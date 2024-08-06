import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Asset } from '../types/asset';

export const usePrintAssets = defineStore('printAssets', () => {
  // 缓存信息
  const list = ref<Asset[]>([]);
  const isResetSelectedPrint = ref(false);

  const $set = (data: Asset[]) => {
    list.value = data || [];
    isResetSelectedPrint.value = false;
  };

  // 提交
  const $reset = () => {
    list.value = [];
  };

  const resetSelectedPrint = () => {
    list.value = [];
    isResetSelectedPrint.value = true;
  };

  return {
    list,
    isResetSelectedPrint,
    resetSelectedPrint,
    $set,
    $reset,
  };
});
