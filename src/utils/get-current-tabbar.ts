import {
  IOrganizationInfo,
  IndustryCode,
  LocationLevel,
  LocationType,
} from '@/store/modules/login';
import { EUserType } from '@/utils/kind';

/** tabbar item类型 */
export interface ITabBarItem {
  pagePath: string;
  iconPath: string;
  selectedIconPath: string;
  text: string;
  count?: number;
  isDot?: boolean;
}

export const teacherTabbarList: ITabBarItem[] = [
  {
    iconPath: '/static/tabbar/icon_tabbar_home.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_home_selected.png',
    pagePath: '/pages/workbench/index',
    text: '工作台',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_contacts.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_contacts_selected.png',
    pagePath: '/pages/contacts/index',
    text: '通讯录',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_message.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_message_selected.png',
    pagePath: '/pages/message/index',
    text: '消息',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_mine.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_mine_selected.png',
    pagePath: '/pages/mine/index',
    text: '我的',
  },
];

export const studentTabbarList: ITabBarItem[] = [
  {
    iconPath: '/static/tabbar/icon_tabbar_home.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_home_selected.png',
    pagePath: '/pages/workbench/index',
    text: '首页',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_message.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_message_selected.png',
    pagePath: '/pages/message/index',
    text: '消息',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_mine.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_mine_selected.png',
    pagePath: '/pages/mine/index',
    text: '我的',
  },
];

export const guardianTabbarList: ITabBarItem[] = [
  {
    iconPath: '/static/tabbar/icon_tabbar_home.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_home_selected.png',
    pagePath: '/pages/workbench/index',
    text: '首页',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_message.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_message_selected.png',
    pagePath: '/pages/message/index',
    text: '消息',
  },
  {
    iconPath: '/static/tabbar/icon_tabbar_mine.png',
    selectedIconPath: '/static/tabbar/icon_tabbar_mine_selected.png',
    pagePath: '/pages/mine/index',
    text: '我的',
  },
];

export const getCurrentTabbarList = (userType: EUserType, organizationInfo?: IOrganizationInfo) => {
  let tabbarList: ITabBarItem[] = [];
  switch (userType) {
    case EUserType.teacher:
      // 通讯录，仅针对角色“教职工”显示且组织类型为“K12或幼教”学校
      if (
        organizationInfo &&
        (organizationInfo.locationType === LocationType.K12 ||
          organizationInfo.locationType === LocationType.PreSchool ||
          (organizationInfo.industryCode === IndustryCode.Edu &&
            organizationInfo.locationLevel === LocationLevel.Bureau)) //组织类型：教育 执行单位：管理单位
      ) {
        tabbarList = teacherTabbarList;
      } else {
        tabbarList = guardianTabbarList;
      }
      break;
    case EUserType.student:
      tabbarList = studentTabbarList;
      break;
    case EUserType.guardian:
      tabbarList = guardianTabbarList;
      break;
  }
  return tabbarList;
};
