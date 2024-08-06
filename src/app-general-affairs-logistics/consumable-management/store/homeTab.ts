import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 是否为管理员、超管、资产管理员 */
export const useTab = defineStore('tabStore', () => {
  const tabIndex = ref<number>(0);
  const $set = (res?: number) => {
    tabIndex.value = res || 0;
  };

  const $reset = () => (tabIndex.value = 0);

  return {
    tabIndex,
    $set,
    $reset,
  };
});
