import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 是否为管理员、超管、资产管理员 */
export const useAdmin = defineStore('isAdminStore', () => {
  const isAdmin = ref<boolean>(false);
  const $set = (res?: boolean) => {
    isAdmin.value = res || false;
  };

  const $reset = () => (isAdmin.value = false);

  return {
    isAdmin,
    $set,
    $reset,
  };
});
