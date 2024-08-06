import { request } from '@/utils/request';

export interface ISpaceTree {
  id: string;
  name: string;
  permission: string; // 是否有权限1为有权限，0为无权限
  parentId: string;
  children: ISpaceTree[];
}

export const getUserPermissionSpaceTree = () =>
  request<ISpaceTree[]>('/space/getUserPermissionSpaceTree?flag=0', {}, 'GET');
