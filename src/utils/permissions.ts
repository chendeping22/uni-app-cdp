import { ITreePermission } from '@/store/modules/env';

/**
 * 判断是否有权限
 * @param treePermissions
 * @param key
 */
export const hasPermission = (treePermissions: ITreePermission[], key: string) =>
  _check(treePermissions, key);

/**
 * 迭代匹配
 */
const _check = (treePermissions: ITreePermission[], key: string) => {
  const res = treePermissions.some(item => {
    if (item.permissionCode === key) return true;
    if (item.childs?.length) {
      const temp = _check(item.childs, key);
      if (temp) return true;
    }
    return false;
  });
  return res;
};
