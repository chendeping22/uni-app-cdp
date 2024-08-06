import { getTreePermissions } from '@/services/user';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ITreePermission } from './env';
/**
 * permissions
 * 用户权限
 */
export const treePermissionsStore = defineStore('treePermissions', () => {
  // 未读消息数
  const treePermissions = ref<ITreePermission[]>([]);
  const fetchTreePermissions = async () => {
    try {
      const res = await getTreePermissions();
      treePermissions.value = res;
      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return {
    treePermissions,
    fetchTreePermissions,
  };
});
