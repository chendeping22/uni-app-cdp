import { getCurrentTabbarList, type ITabBarItem } from '@/utils/get-current-tabbar';
import { EUserType, getUserType } from '@/utils/kind';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { IOrganizationInfo, LocationType } from './login';

export const tabBarStore = defineStore('tabBarStore', () => {
  // 应用组合
  const kinds = import.meta.env.VITE_COMPOSITION.split('_');
  // 取默认
  const singleKind = kinds[0];
  // 家长学生组合
  const isGuardianStudentKind =
    kinds.length == 2 && kinds.includes('guardian') && kinds.includes('student');

  // 是否使用原生tabbar
  const isNativeTabBar = ref(
    import.meta.env.VITE_COMPOSITION.split('_').length < 2 || isGuardianStudentKind,
  );
  // 当前tabbar列表
  const organization = {
    locationType: LocationType.K12,
  };
  const currentTabbarList: ITabBarItem[] = getCurrentTabbarList(
    getUserType(singleKind),
    organization as IOrganizationInfo,
  );
  // 组织信息
  const currentTabBar = ref<ITabBarItem[]>(currentTabbarList);

  const updateTabBar = (userType: EUserType, organizationInfo?: IOrganizationInfo) => {
    currentTabBar.value = getCurrentTabbarList(userType, organizationInfo);
  };
  return {
    isNativeTabBar,
    currentTabBar,
    updateTabBar,
  };
});
