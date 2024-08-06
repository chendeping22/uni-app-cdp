import {
  getApplications,
  getBanners,
  getFavoriteApplications,
  getFollowStatus,
  getWorkbenchList,
} from '@/services/workbench';
import { updateWorkbenchInfoCache } from '@/utils/cache-app';
import { isApplicationEnable } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { workbench_widget_sort_key } from '@/utils/storage-keys';
import { hideLoading, showLoading } from '@/utils/tools';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginStore } from './login';

/** 用户类型 */
export enum ETargetType {
  TargetTypeNative = 1, // 打开原生应用
  TargetTypeAbsoluteH5 = 2, // 打开完整链接H5应用
  TargetTypeRelativeH5AtImp = 3, //自动拼接域名，比如：相对路径为`/a/b`，拼接后地址为`https://imp.leedarson.com/a/b`
  TargetTypeRelativeH5AtLowCode = 4, //自动拼接域名，比如：相对路径为`/a/b`，拼接后地址为`https://lowcode.leedarson.com/a/b`
  TargetTypeOpenWechatMiniProgram = 5, //打开微信小程序
  TargetTypeRelativeH5AtTraining = 6, // 自动拼接实训域名，比如：相对路径为`/a/b`，拼接后地址为`https://imp.leedarson.com/openh5/a/b`
  TargetTypeAllApplication = 999, // 更多（app自定义）
}

/** 基座类型*/
export enum EApplicationType {
  Old = 1, // 旧基座
  New = 2, // 新基座
  Third = 3, // 第三方
}
/** 布局类型*/
export enum EWorkbenchLayoutType {
  Navigation = 'Navigation', //应用导航区
  Banner = 'Banner', //banner区
  Widget = 'Widget', //应用组件区
}

export interface IApplicationCategory {
  categoryId: string;
  categoryName: string;
  applications: IApplication[];
}

export interface IBanner {
  id: number;
  title: string;
  content: string;
  publishTime: number;
  url: string;
}

export interface IApplication {
  code: string;
  icon: string;
  id: string;
  name: string;
  path: string; // 路径
  target: ETargetType; //1: 打开原生应用, 2: 打开H5应用
  type: EApplicationType; // 应用类型
}

export interface IWorkbench {
  layouts: ILayout[];
  widgets: IWidget[];
}

export interface IWidgetGroup {
  id: string;
  title: string; //组件标题
  widgets: IWidget[];
}

export interface ILayout {
  code: EWorkbenchLayoutType; //组件code
  enable: boolean; //组件是否开启
}

export interface IWidget {
  id: string;
  title: string;
  screenshot: string;
  applicationName: string; //应用名称
  applicationLogoUrl: string; //归属应用图片地址
  config: string; // widget 小组件vue名称
  layout: string; //取y值排序 跟web保持一致
  hasPermission: boolean; //是否有权限
  adaptiveCardHeight?: number; //自适应高度 app自定义
}

export interface IWidgetConfig {
  widget: string; //小组件
  w: number; //默认为1 app暂时用不到
  h: number; //小组件高度 单位rpx
}

export const workbenchStore = defineStore('workbenchStore', () => {
  // 应用信息列表
  const applicationCategoryList = ref<IApplicationCategory[]>([]);
  // banner列表
  const bannerList = ref<IBanner[]>([]);
  // 收藏列表
  const favoriteApplicationList = ref<IApplication[]>([]);
  // 工作台列表
  const initWorkbench = {
    layouts: [
      { code: EWorkbenchLayoutType.Navigation, enable: true },
      { code: EWorkbenchLayoutType.Banner, enable: true },
      { code: EWorkbenchLayoutType.Widget, enable: true },
    ],
    widgets: [],
  };
  const workbench = ref<IWorkbench>(initWorkbench);
  // 是否有关注公众号
  const hasFollowOfficialAccounts = ref<number>(1);

  const fetchApplicationCategorysData = async (loading: boolean) => {
    try {
      if (loading) {
        showLoading();
      }
      let res = await getApplications();
      // #ifndef MP-WEIXIN
      if (Array.isArray(res)) {
        const cateList: Array<IApplicationCategory> = [];
        res.forEach((cate: IApplicationCategory) => {
          const appList: IApplication[] = cate.applications.filter(item => {
            return isApplicationEnable(item.code);
          });
          if (appList.length) {
            cate.applications = appList;
            cateList.push(cate);
          }
        });
        res = cateList;
      }
      // #endif
      applicationCategoryList.value = (res as Array<IApplicationCategory>) || [];
      updateWorkbenchInfoCache();
      if (loading) {
        hideLoading();
      }
      return res;
    } catch (error) {
      if (loading) {
        hideLoading();
      }
      return Promise.reject(error);
    }
  };
  const fetchBannersData = async (showLoading: boolean) => {
    try {
      const res = await getBanners(showLoading);
      console.log('banner', res);
      bannerList.value = (res as IBanner[]) || [];
      updateWorkbenchInfoCache();
      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const fetchFavoriteApplicationData = async (showLoading: boolean) => {
    try {
      let res = await getFavoriteApplications(showLoading);
      // #ifndef MP-WEIXIN
      if (Array.isArray(res)) {
        res = res.filter(item => {
          return isApplicationEnable(item.code);
        });
      }
      // #endif
      favoriteApplicationList.value = (res as IApplication[]) || [];
      updateWorkbenchInfoCache();
      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  };
  const fetchWorkbenchData = async (showLoading: boolean) => {
    try {
      const res = await getWorkbenchList(showLoading);
      // 过滤掉没权限的组件
      if (res.widgets) {
        res.widgets = res.widgets.filter(item => item.hasPermission);
      }
      // 本地顺序优先
      if (res.widgets) {
        res.widgets = workbenchWidgetSortByLocalCache(res.widgets);
      }
      workbench.value = res;
      updateWorkbenchInfoCache();
      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const resetWorkbenchData = () => {
    applicationCategoryList.value = [];
    favoriteApplicationList.value = [];
    workbench.value = initWorkbench;
  };

  const fetchFollowState = async () => {
    try {
      const res = await getFollowStatus();
      hasFollowOfficialAccounts.value = res?.subscribe || 0;
    } catch (error) {}
  };

  const workbenchWidgetSortCachekey = () => {
    const login = loginStore();
    if (login.currentUserType == EUserType.teacher) {
      const locationId = login.currentOrganization?.id;
      const accountId = login.userInfo?.accountId ?? '';
      const userId = login.userInfo?.id ?? '';
      return (
        workbench_widget_sort_key + `${login.currentUserType}_${locationId}_${accountId}_${userId}`
      );
    } else if (login.currentUserType == EUserType.guardian) {
      const accountId = login.userInfo?.id ?? '';
      const userId = login.userInfo?.personId ?? '';
      const studentId = login.currentOrganization?.childId + '';
      return (
        workbench_widget_sort_key + `${login.currentUserType}_${accountId}_${userId}_${studentId}`
      );
    } else if (login.currentUserType == EUserType.student) {
      const accountId = login.userInfo?.id ?? '';
      const studentId = login.userInfo?.personId ?? '';
      return workbench_widget_sort_key + `${login.currentUserType}_${accountId}_${studentId}`;
    } else {
      return workbench_widget_sort_key;
    }
  };

  const workbenchWidgetSortByLocalCache = (widgets: IWidget[]): IWidget[] => {
    try {
      const widgetSortTitles = uni.getStorageSync(workbenchWidgetSortCachekey()) ?? [];
      if (widgetSortTitles.length > 0) {
        const operateWidgets = [...widgets];
        //本地排序的组件列表
        const sortWidgets: IWidget[] = [];
        widgetSortTitles.forEach(widgetTitle => {
          const selectItem = operateWidgets.find(item => item.title === widgetTitle);
          if (selectItem) {
            sortWidgets.push(selectItem);
            // 移除找到的元素
            const indexToRemove = operateWidgets.indexOf(selectItem);
            if (indexToRemove > -1) {
              operateWidgets.splice(indexToRemove, 1);
            }
          }
        });
        return sortWidgets.concat(operateWidgets);
      }
      return widgets;
    } catch (error) {
      return widgets;
    }
  };

  const updateWorkbenchWidgetSortCache = (widgets: IWidget[]) => {
    const widgetSortTitles = widgets.map(item => item.title) ?? [];
    uni.setStorageSync(workbenchWidgetSortCachekey(), widgetSortTitles);
  };

  return {
    applicationCategoryList,
    favoriteApplicationList,
    workbench,
    bannerList,
    fetchBannersData,
    fetchApplicationCategorysData,
    fetchFavoriteApplicationData,
    fetchWorkbenchData,
    resetWorkbenchData,
    fetchFollowState,
    hasFollowOfficialAccounts,
    workbenchWidgetSortByLocalCache,
    updateWorkbenchWidgetSortCache,
  };
});
