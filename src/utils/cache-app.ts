import { contactStore } from '@/store/modules/contacts';
import type { IAuthInfo, IUserInfo } from '@/store/modules/env';
import {
  IMqttInfo,
  loginStore,
  type IOrganizationInfo,
  type IOrganizationList,
} from '@/store/modules/login';
import {
  IApplicationCategory,
  IBanner,
  workbenchStore,
  type IApplication,
  type IWorkbench,
} from '@/store/modules/workbench';
import { toRefs } from 'vue';
import type { EUserType } from './kind';
import { app_key, contacts_student_clazz_key, contacts_student_key } from './storage-keys';
import { log } from './tools';

const regexContactKey = /(^|_)(contactsStudentClazz|contactsStudent)($|(un|_|-).+)/;
const regexPermissionKey = /(^|_|app)treePermission($|-front$|-last$)/;

export interface IAppInfo {
  organizationList?: IOrganizationList;
  authInfo?: IAuthInfo;
  mqttInfo?: IMqttInfo;
  userInfo?: IUserInfo;
  currentOrganization?: IOrganizationInfo;
  currentUserType?: EUserType;

  bannerList?: IBanner[];
  favoriteApplicationList?: IApplication[];
  workbench?: IWorkbench;
  applicationCategoryList?: IApplicationCategory[];
}

export const getAppInfo = () => {
  const appInfo = uni.getStorageSync(app_key);
  return appInfo;
};

export const updateLoginInfoCache = () => {
  uni.getStorage({
    key: app_key,
    success: function (res) {
      updateLoginInfoByAppInfo(res.data);
    },
    fail() {
      updateLoginInfoByAppInfo({});
    },
  });
};

const updateLoginInfoByAppInfo = data => {
  let appInfo = data;
  const { organizationList, authInfo, mqttInfo, userInfo, currentOrganization, currentUserType } =
    loginStore();
  appInfo = {
    ...(appInfo ?? {}),
    organizationList,
    authInfo,
    mqttInfo,
    userInfo,
    currentOrganization,
    currentUserType,
  };
  uni.setStorage({
    key: app_key,
    data: appInfo,
    fail(result: any) {
      console.error('appInfo Storage fail=1', result);
    },
  });
};

export const updateUserInfoCache = () => {
  const appInfo: IAppInfo = uni.getStorageSync(app_key);
  const login = loginStore();
  if (JSON.stringify(appInfo.userInfo) !== JSON.stringify(login.userInfo)) {
    appInfo.userInfo = login.userInfo;
    uni.setStorageSync(app_key, appInfo);
  }
};

export const updateOrganizationInfoCache = () => {
  const appInfo: IAppInfo = uni.getStorageSync(app_key);
  const login = loginStore();
  appInfo.organizationList = login.organizationList;
  appInfo.currentOrganization = login.currentOrganization;
  uni.setStorageSync(app_key, appInfo);
};

export const updateMqttInfoCache = () => {
  const appInfo: IAppInfo = uni.getStorageSync(app_key);
  const login = loginStore();
  if (JSON.stringify(appInfo.mqttInfo) !== JSON.stringify(login.mqttInfo)) {
    appInfo.mqttInfo = login.mqttInfo;
    uni.setStorageSync(app_key, appInfo);
  }
};

export const updateWorkbenchInfoCache = () => {
  let appInfo: IAppInfo = uni.getStorageSync(app_key);
  const { bannerList, favoriteApplicationList, workbench, applicationCategoryList } =
    workbenchStore();
  appInfo = {
    ...(appInfo ?? {}),
    bannerList,
    favoriteApplicationList,
    workbench,
    applicationCategoryList,
  };
  uni.setStorageSync(app_key, appInfo);
};

const storage_key_suffix = () => {
  const login = loginStore();
  if (login.userInfo && login.userInfo.locationId) {
    const uid = login.userInfo.accountId || login.userInfo.id || '';
    return `_${login.userInfo.locationId}_${uid}`;
  }
  return '';
};

export const updateContactInfoCache = () => {
  const { clazzList, stuContactForStore } = contactStore();
  const suffix = storage_key_suffix();
  uni.setStorageSync(contacts_student_key + suffix, stuContactForStore);
  uni.setStorageSync(contacts_student_clazz_key + suffix, clazzList);
};

const clearHistoryCache = (regex: RegExp) => {
  const res = uni.getStorageInfoSync();
  if (res.keys && Array.isArray(res.keys)) {
    res.keys.forEach((key: string) => {
      if (regex.test(key)) {
        uni.removeStorageSync(key);
      }
    });
  }
};

/**
 * 删除班级和学生缓存
 */
export const clearContactInfoCache = () => {
  clearHistoryCache(regexContactKey);
  const suffix = storage_key_suffix();
  uni.removeStorageSync(contacts_student_key + suffix);
  uni.removeStorageSync(contacts_student_clazz_key + suffix);
  initContactInfo();
};

/**
 * 删除学生缓存
 */
export const clearContactStudents = () => {
  clearHistoryCache(regexContactKey);
  uni.removeStorageSync(contacts_student_clazz_key + storage_key_suffix());
  initContactInfo();
};

export const initLoginInfo = () => {
  const appInfo = getAppInfo();
  const login = loginStore();
  const { organizationList, currentUserType } = toRefs(login);
  clearAllRedDot(appInfo.organizationList);
  organizationList.value = appInfo.organizationList;
  login.updateOrganization(appInfo.currentOrganization);
  login.updateAuthInfo(appInfo.authInfo);
  login.updateMqttInfo(appInfo.mqttInfo);
  login.updateUserInfo(appInfo.userInfo);
  currentUserType.value = appInfo.currentUserType;
};

export const initWorkbenchInfo = () => {
  const appInfo = getAppInfo();
  const { bannerList, favoriteApplicationList, workbench, applicationCategoryList } = toRefs(
    workbenchStore(),
  );
  bannerList.value = appInfo.bannerList;
  favoriteApplicationList.value = appInfo.favoriteApplicationList;
  // 没数据，使用默认的初始化数据
  if (appInfo.workbench) {
    workbench.value = appInfo.workbench;
  }
  applicationCategoryList.value = appInfo.applicationCategoryList;
};

export const initContactInfo = () => {
  const contact = contactStore();
  const { clazzList, stuContactForStore } = toRefs(contact);
  const suffix = storage_key_suffix();
  stuContactForStore.value = uni.getStorageSync(contacts_student_key + suffix);
  clazzList.value = uni.getStorageSync(contacts_student_clazz_key + suffix);
  log('initContactInfo_stuContactForStore : ', stuContactForStore.value);
  log('initContactInfo_clazzList : ', clazzList.value);
};

export const clearAllRedDot = (organizationList: IOrganizationList) => {
  if (!organizationList || !organizationList.locations) {
    return;
  }
  for (const organization of organizationList.locations) {
    clearRedDotOrganization(organization.locations);
  }
};

export const clearCacheData = () => {
  clearHistoryCache(regexPermissionKey);
  uni.removeStorageSync(app_key);
};

const clearRedDotOrganization = (locations: IOrganizationInfo[]) => {
  for (const info of locations) {
    info.showRedDot = false;

    if (info.children && info.children.length > 0) {
      clearRedDotOrganization(info.children);
    }
  }
};
