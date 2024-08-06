import { ITreePermission } from '@/store/modules/env';
import { treePermissionsStore } from '@/store/modules/treePermissions';
import { computed, ComputedRef, unref } from 'vue';

/**
 * 权限
 * @returns ITreePermission[]
 */
export default function usePermissions(): ComputedRef<ITreePermission[]> {
  return computed(() => {
    return unref(treePermissionsStore().treePermissions);
  });
}
