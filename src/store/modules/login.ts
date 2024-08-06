import { getMqttConnectInfo } from '@/services/mqtt';
import {
  changeLocation,
  getUserInfo,
  getUserInfoNew,
  getUserType,
  locations,
  refreshLogin,
  refreshToken as refreshTokenService,
} from '@/services/user';
import { ETerminal, type IAuthInfo, type IEnv, type IUserInfo } from '@/store/modules/env';
import { tabBarStore } from '@/store/modules/tabbar';
import {
  clearCacheData,
  clearContactInfoCache,
  initContactInfo,
  initLoginInfo,
  initWorkbenchInfo,
  updateLoginInfoCache,
  updateMqttInfoCache,
  updateOrganizationInfoCache,
  updateUserInfoCache,
} from '@/utils/cache-app';
import { EUserType, initUserType } from '@/utils/kind';
import { isNil } from '@/utils/lodash-es';
import { logout } from '@/utils/logout';
import { getPushCid } from '@/utils/push_cid';
import { haveLogin } from '@/utils/refresh-token';
import { cid_key, clientId_key, tokenTime_key } from '@/utils/storage-keys';
import { getWxCode, log } from '@/utils/tools';
import track from '@/utils/track';
import { defineStore } from 'pinia';
import * as sentry from 'sentry-mina';
import { ref } from 'vue';
import { workbenchStore } from './workbench';
export interface IOrganizationList {
  accessToken: string;
  expireTime: string;
  refreshToken: string;
  refreshExpireTime: string;
  isDefaultPwd: boolean;
  needToSwitch?: boolean;
  isBindMobile: boolean;
  tokenHeaderName: string;
  phoneNumber: string;

  locations: IOrganization[];
}

export interface IOrganization {
  userType: number; //0教职工 1学生 2家长
  locations: IOrganizationInfo[];
}

/** 组织类型 */
export enum LocationType {
  /** 学前教育 */
  PreSchool = 'Pre:School',
  /** K12 */
  K12 = 'K12',
  /** 中职 */
  SecondaryVocational = 'Secondary:Vocational',
  /** 高校 */
  College = 'College',
  /** 教育局 */
  Edu = 'Edu',
  /** 集团校 */
  GroupSchool = 'Group:School',
  /** 园区 */
  Park = 'Park',
  /** 子公司 */
  Subsidiary = 'Subsidiary',
  /** 企业总部 */
  EnterpriseHeadquarters = 'Enterprise:Headquarters',
}

/**
 * 组织级别
 */
export enum LocationLevel {
  /** 0: 管理单位，局端 */
  Bureau,
  /** 1: 执行单位，校端 */
  School,
}

/**
 * 组织行业类型
 */
export enum IndustryCode {
  /** 0: 教育行业 */
  Edu = 'Edu',
  /** 1: 制造业 */
  Manu = 'Manu',
}

export interface IOrganizationInfo {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  locationLevel: LocationLevel; //组织级别
  locationLevelName: string;
  children: IOrganizationInfo[];
  relationship: string;
  isRecentlyLogin: boolean;
  logoFileId: string;
  logoFileUrl: string;
  createTime: number;
  locationType: LocationType;
  showRedDot: boolean; // 红点：app自定义
  imageFileUrl: string; //家长学生头像
  childId: number; //当前小孩id
  childName: string; //当前孩子名称
  childImage: string; //头像地址
  clazzDesc: string; //班级描述
  clazzId: string; //班级id
  clazzName: string; //班级名称
  gradeId: string; //年级id
  gradeName: string; //年级名称
  industryCode: IndustryCode; // 组织行业
}

export interface IMqttInfo {
  mqttHost?: string;
  mqttPassword?: string;
  mqttHostProtocol?: string;
  mqttUuid?: string;

  websocketAddress?: string;
}

export const loginStore = defineStore('loginStore', () => {
  // 组织信息
  const organizationList = ref<IOrganizationList>();
  // 授权信息
  const authInfo = ref<IAuthInfo>();
  // mqtt信息
  const mqttInfo = ref<IMqttInfo>();
  // 用户信息
  const userInfo = ref<IUserInfo>();
  // 当前组织
  const currentOrganization = ref<IOrganizationInfo>();
  // 当前角色
  const currentUserType = ref<EUserType>(initUserType());
  // 环境信息
  const currentEnv = ref<IEnv>({});

  const initEnvInfo = () => {
    // #ifdef APP-PLUS
    const platform = uni.getSystemInfoSync().platform;
    if (platform === 'ios') {
      currentEnv.value.terminal = ETerminal.iOS;
    } else if (platform == 'android') {
      currentEnv.value.terminal = ETerminal.Android;
    }
    // #endif
    // #ifdef H5
    currentEnv.value.terminal = ETerminal.H5;
    // #endif
    // #ifdef MP-WEIXIN
    currentEnv.value.terminal = ETerminal.Wechat;
    // #endif
  };
  initEnvInfo();

  const updateOrganizationList = (tmpOrganizationList: IOrganizationList) => {
    organizationList.value = tmpOrganizationList;
    const now = Date.now();
    updateToken({
      accessToken: tmpOrganizationList.accessToken,
      tokenExpire: Number(tmpOrganizationList.expireTime) * 1000 + now,
      refreshToken: tmpOrganizationList.refreshToken,
      refreshExpire: Number(tmpOrganizationList.refreshExpireTime) * 1000 + now,
      tokenHeaderName: tmpOrganizationList.tokenHeaderName,
    });
  };

  const updateOrganization = (organization: IOrganizationInfo) => {
    currentOrganization.value = organization;
  };

  const updateRecentlyLoginInfo = (userType: number, locationId: string, childId: number) => {
    const tmpOrganizationList = organizationList.value as IOrganizationList;
    for (const organization of tmpOrganizationList.locations) {
      resetSelectOrganizationInfo(
        organization.locations,
        organization.userType === userType,
        locationId,
        childId,
      );
    }
  };

  const resetSelectOrganizationInfo = (
    locations: IOrganizationInfo[],
    isUserType: boolean,
    locationId: string,
    childId: number,
  ): IOrganizationInfo | undefined => {
    for (const info of locations) {
      if (isUserType && info.id === locationId && info.childId === childId) {
        info.isRecentlyLogin = true;
      } else {
        info.isRecentlyLogin = false;
      }

      if (!isNil(info.children) && info.children.length > 0) {
        resetSelectOrganizationInfo(info.children, isUserType, locationId, childId);
      }
    }

    return undefined;
  };

  const updateToken = (params: Partial<IAuthInfo>) => {
    authInfo.value = {
      ...authInfo.value,
      ...params,
    };
    const currentTimestamp = Math.floor(Date.now() / 1000);
    uni.setStorageSync(tokenTime_key, currentTimestamp);
  };

  const updateMqttInfo = (tmpMqttInfo: IMqttInfo) => {
    mqttInfo.value = tmpMqttInfo;
  };

  const updateAuthInfo = (tmpAuthInfo: IAuthInfo) => {
    authInfo.value = tmpAuthInfo;
  };

  const updateUserInfo = (tmpUserInfo: IUserInfo) => {
    userInfo.value = tmpUserInfo;
  };

  const updateUserType = (role: EUserType) => {
    currentUserType.value = role;
  };

  // 清除缓存
  const clearAllData = () => {
    organizationList.value = undefined;
    authInfo.value = undefined;
    mqttInfo.value = undefined;
    userInfo.value = undefined;
    currentOrganization.value = undefined;
    currentUserType.value = initUserType();
    workbenchStore().resetWorkbenchData();
    uni.removeStorageSync(clientId_key);
    uni.removeStorageSync(tokenTime_key);
    clearCacheData();
    clearContactInfoCache();
  };

  // 消息通知切换身份并通知
  const changeIdentityThenNotify = async (
    userId: string,
    userClientType: string,
    locationId: string,
    locationType: string,
    callback?: Function,
  ) => {
    log(
      'userId : ' +
        userId +
        ', userClientType : ' +
        userClientType +
        ', locationId : ' +
        locationId,
    );

    let findOrganization = undefined;
    for (const value of organizationList.value.locations) {
      if (value.userType != Number(userClientType)) {
        continue;
      }
      const info = findOrganizationInfo(locationId, value.locations);
      if (info) {
        findOrganization = info;
        break;
      }
    }
    if (!findOrganization) {
      log('组织树种找不到' + locationId + '组织');
      return Promise.reject({ desc: '找不到消息对应的组织' });
    }
    const organization: any = findOrganization;
    log('organization : ', organization);
    // B端
    if (userClientType) {
      log('changeIdentity');
      try {
        const identity = await changeIdentity(0, organization);
        log('切换成功1', identity);
      } catch (error) {
        return Promise.reject(error);
      }
      return callback && callback();
    } else {
      log('getUserType');
      if (userId) {
        //0教职工 1学生 2家长
        const { userIdentity } = await getUserType(userId);
        log('userIdentity : ', userIdentity);
        const userType = userIdentity + '';
        if (userType) {
          try {
            const identity = await changeIdentity(Number(userType), organization);
            log('切换成功2', identity);
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
      return callback && callback();
    }
  };

  // 消息通知切换身份并通知
  const changeIdentityThenNotifyWx = async (
    userId: string,
    userType: string,
    locationId: string,
    callback?: Function,
  ) => {
    log('userId : ' + userId + ', userType : ' + userType + ', locationId : ' + locationId);

    let findOrganization = undefined;
    log('organizationList : ', organizationList.value.locations);
    for (const value of organizationList.value.locations) {
      if (value.userType != Number(userType)) {
        continue;
      }
      // const info = mapTree(value.locations, locationId);
      const info = findOrganizationInfo(locationId, value.locations);
      if (info) {
        findOrganization = info;
        break;
      }
    }
    if (!findOrganization) {
      log('组织树种找不到' + locationId + '组织');
      return Promise.reject({ desc: '找不到消息对应的组织' });
    }
    const organization: any = findOrganization;
    log('organization : ', organization);
    if (userType) {
      log('changeIdentity');
      try {
        const identity = await changeIdentity(Number(userType), organization);
        log('切换成功1', identity);
      } catch (error) {
        return Promise.reject(error);
      }
      return callback && callback();
    } else {
      log('getUserType');
      if (userId) {
        // 0教职工 1学生 2家长
        // userId换userType（必须要是C端用户）
        const { userIdentity } = await getUserType(userId);
        log('userIdentity : ', userIdentity);
        const userType = userIdentity + '';
        if (userType) {
          try {
            const identity = await changeIdentity(Number(userType), organization);
            log('切换成功2', identity);
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
      return callback && callback();
    }
  };

  // 切换身份
  const changeIdentity = async (userType: number, organization: IOrganizationInfo) => {
    try {
      let cid = '';
      let wxCode = '';
      let appId = '';
      // #ifdef APP-PLUS
      cid = uni.getStorageSync(cid_key) || '';
      if (!cid || cid.length === 0 || cid === 'null') {
        const temp = await getPushCid();
        log('getPushCid : ', temp);
        cid = temp.clientid || '';
        if (cid && cid.length > 0 && cid !== 'null') {
          uni.setStorageSync(cid_key, cid);
        } else {
          sentry.captureException({
            event: 'getPushCid',
            userType: userType,
            organization: organization,
            accountName: userInfo.value?.accountName,
            desc: '获取的cid为空',
          });
          log('==========获取的cid为空');
        }
      }
      // #endif
      // #ifdef MP-WEIXIN
      const code = await getWxCode();
      if (!code) {
        return Promise.reject({ desc: '获取code失败！请检查网络连接' });
      }
      wxCode = code;
      const { miniProgram } = uni?.getAccountInfoSync();
      appId = miniProgram.appId;
      // #endif

      let time = new Date().getTime();
      const startTime = time;
      changeIdentityLog('changeLocation', true, 0);
      const res: any = await changeLocation(
        userType,
        organization.id,
        cid,
        organization.childId,
        wxCode,
        appId,
      );
      track('switch_location', { locationId: organization.id });
      changeIdentityLog('changeLocation', false, time);

      time = new Date().getTime();
      changeIdentityLog('updateLocationData', true, 0);
      updateToken({
        accessToken: res.accessToken,
        tokenHeaderName: res.tokenHeaderName,
      });
      updateUserType(userType);
      updateOrganization(organization);
      tabBarStore().updateTabBar(userType, organization);
      changeIdentityLog('updateLocationData', false, time);

      time = new Date().getTime();
      changeIdentityLog('updateLocationData', true, 0);
      updateRecentlyLoginInfo(userType, organization.id, organization.childId);
      changeIdentityLog('updateLocationData', false, time);

      // userinfo
      await getUserInfoAndUpdateDataApi();
      // mqtt
      await getMqttInfoAndUpdateDataApi();

      time = new Date().getTime();
      changeIdentityLog('updateLocationData appdata', true, 0);
      // updateLoginInfoCache();
      updateLoginInfoCache();

      changeIdentityLog('updateLocationData appdata', false, time);
      log('切换组织', `总耗时:${new Date().getTime() - startTime}ms`);
      return res;
    } catch (error) {
      console.error('changeIdentity error', error);
      sentry.captureException({
        event: 'changeIdentity',
        userType: userType,
        organization: organization,
        accountName: userInfo.value?.accountName,
        error: error,
      });
      return Promise.reject(error);
    }
  };

  // 更新userInfo处理
  const updateUserInfoHandle = async () => {
    try {
      await getUserInfoAndUpdateDataApi();
      updateUserInfoCache();
    } catch (error) {}
  };

  // 获取userInfo信息并更新
  const getUserInfoAndUpdateDataApi = async () => {
    try {
      let time = new Date().getTime();
      changeIdentityLog('getUserInfo', true, 0);
      const userInfoRes = await getUserInfo(false, false);
      changeIdentityLog('getUserInfo', false, time);

      // 新用户信息接口
      time = new Date().getTime();
      changeIdentityLog('getUserInfoNew', true, 0);
      const userInfoResNew = await getUserInfoNew();
      Object.assign(userInfoRes, {
        // accountId: userInfoResNew.accountId ? userInfoResNew.userId : userInfoRes.accountId,
        userId: userInfoResNew.userId ? userInfoResNew.userId : userInfoRes.userId,
        name: userInfoResNew.name ? userInfoResNew.name : userInfoRes.userName,
        headImageUrl: userInfoResNew.headImageUrl,
        position: userInfoResNew.position,
        students: userInfoResNew.students,
        deptId: userInfoResNew.deptId,
        deptName: userInfoResNew.deptName,
      });
      updateUserInfo(userInfoRes);
      changeIdentityLog('getUserInfoNew', false, time);
      return userInfoRes;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // 更新mqtt处理
  const updateMqttInfoHandle = async () => {
    try {
      await getMqttInfoAndUpdateDataApi();
      updateMqttInfoCache();
    } catch (error) {}
  };

  // 获取mqtt信息并更新
  const getMqttInfoAndUpdateDataApi = async () => {
    try {
      let time = new Date().getTime();
      changeIdentityLog('getMqttConnectInfo', true, 0);
      const mqtt: any = await getMqttConnectInfo(uni.getStorageSync(clientId_key));
      changeIdentityLog('getMqttConnectInfo', false, time);

      time = new Date().getTime();
      changeIdentityLog('updateLocationData mqtt', true, 0);
      updateMqttInfo(mqtt.data);
      changeIdentityLog('updateLocationData mqtt', false, time);
      return mqtt;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const isTokenExpire = () => {
    if (authInfo.value?.tokenExpire && Date.now() >= authInfo.value.tokenExpire - 1800000) {
      return true;
    }
    return false;
  };

  /** 是否正在刷新token */
  let isRefreshingToken = false;
  const refreshToken = () => {
    if (!isRefreshingToken && authInfo.value?.accessToken && authInfo.value?.refreshToken) {
      isRefreshingToken = true;
      return refreshTokenService(authInfo.value.accessToken, authInfo.value.refreshToken)
        .then(res => {
          const now = Date.now();
          updateToken({
            accessToken: res.accessToken,
            tokenExpire: Number(res.expireTime) * 1000 + now,
            refreshToken: res.refreshToken,
            refreshExpire: Number(res.refreshExpireTime) * 1000 + now,
          });
          updateLoginInfoCache();
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
    return Promise.reject();
  };
  const refreshTokenOnExpire = () => {
    if (!isRefreshingToken && isTokenExpire()) {
      refreshToken();
    }
  };

  // 刷新登陆
  const verifyLogin = async (isOpenApp = true) => {
    const clientId = uni.getStorageSync(clientId_key);
    if (clientId) {
      if (isOpenApp && haveLogin()) {
        initLoginInfo();
        initWorkbenchInfo();
        initContactInfo();
        tabBarStore().updateTabBar(currentUserType.value, currentOrganization.value);
        compatibilityOldCacheHandle();
        // 更新用户信息
        updateUserInfoHandle();
        // 更新mqtt信息
        updateMqttInfoHandle();
        return {};
      } else {
        try {
          const res: IOrganizationList = (await refreshLogin(clientId)) as IOrganizationList;
          updateOrganizationList(res);
          let recentlyLoginOrganizationInfo: IOrganizationInfo;
          let userType = -1;
          for (const value of res.locations) {
            const info = findRecentlyLoginOrganizationInfo(value.locations);
            if (info) {
              recentlyLoginOrganizationInfo = info;
              userType = value.userType;
              break;
            }
          }
          if (userType !== -1 && !isNil(recentlyLoginOrganizationInfo)) {
            const identity = await changeIdentity(userType, recentlyLoginOrganizationInfo);
            log('切换成功', identity);
            return identity;
          } else {
            clearAllData();
            return Promise.reject({ desc: '没有最近登录信息' });
          }
        } catch (error) {
          clearAllData();
          return Promise.reject(error);
        }
      }
    } else {
      clearAllData();
      return Promise.reject({ desc: 'clientId is null' });
    }
  };

  // 兼容旧版本没有industryCode字段
  const compatibilityOldCacheHandle = () => {
    if (
      !currentOrganization.value?.industryCode ||
      currentOrganization.value?.industryCode.length < 1
    ) {
      locations().then(res => {
        const locations = res as IOrganization[];
        if (
          !organizationList.value ||
          !currentOrganization.value ||
          !locations ||
          locations.length < 1
        ) {
          return;
        }

        organizationList.value.locations = locations;
        let findOrganization;
        for (const value of organizationList.value.locations) {
          if (value.userType != currentUserType.value) {
            continue;
          }
          const info = findOrganizationInfo(currentOrganization.value?.id, value.locations);
          if (info) {
            findOrganization = info;
            break;
          }
        }
        if (findOrganization) {
          currentOrganization.value.industryCode = findOrganization.industryCode;
          tabBarStore().updateTabBar(currentUserType.value, currentOrganization.value);
          updateOrganizationInfoCache();
          log('更新industryCode数据成功');
        }
      });
    }
  };

  // 刷新组织列表
  const refreshOrganizationListHandle = () => {
    locations().then(res => {
      const locationsResult = res as IOrganization[];
      let findOrganization;
      for (const value of locationsResult) {
        if (value.userType != currentUserType.value) {
          continue;
        }
        const info = findOrganizationInfo(currentOrganization.value?.id, value.locations);
        if (info) {
          findOrganization = info;
          break;
        }
      }

      if (findOrganization) {
        if (
          organizationList.value &&
          JSON.stringify(organizationList.value?.locations) !== JSON.stringify(locationsResult)
        ) {
          organizationList.value.locations = locationsResult;
          updateRecentlyLoginInfo(
            currentUserType.value,
            currentOrganization.value?.id ?? '',
            currentOrganization.value?.childId,
          );
          updateOrganizationInfoCache();
          log('需更新组织列表');
        } else {
          log('无需更新组织列表');
        }
      } else {
        logout({ showPrompt: true, prompt: '请重新登录' });
        log('当前组织被删除');
      }
    });
  };

  const changeIdentityLog = (event: string, isRequest: boolean, time: number) => {
    if (isRequest) {
      log(
        '切换组织',
        `请求接口名：${event} ${new Date().getMinutes()}分${new Date().getSeconds()}秒`,
      );
    } else {
      log(
        '切换组织',
        `响应接口名：${event} ${new Date().getMinutes()}分${new Date().getSeconds()}秒`,
        `耗时:${new Date().getTime() - time}ms`,
      );
    }
  };

  const findRecentlyLoginOrganizationInfo = (
    locations: IOrganizationInfo[],
  ): IOrganizationInfo | undefined => {
    for (const info of locations) {
      if (info.isRecentlyLogin) {
        return info;
      }

      if (!isNil(info.children) && info.children.length > 0) {
        const target = findRecentlyLoginOrganizationInfo(info.children);
        if (target) {
          return target;
        }
      }
    }

    return undefined;
  };

  const findOrganizationInfo = (
    locationId: string,
    locations: IOrganizationInfo[],
  ): IOrganizationInfo | undefined => {
    for (const info of locations) {
      if (info.id === locationId) {
        return info;
      }

      if (!isNil(info.children) && info.children.length > 0) {
        const target = findOrganizationInfo(locationId, info.children);
        if (target) {
          return target;
        }
      }
    }

    return undefined;
  };

  // 递归查询树 direct:直查
  const mapTree = (data: IOrganizationInfo[], locationId: string) => {
    let newData = {} as IOrganizationInfo;
    data.some(element => {
      if (element.id === locationId) {
        newData = element;
        return true;
      } else {
        if (element.children && element.children.length > 0) {
          const redata = mapTree(element.children, locationId);
          if (redata.id === locationId) {
            newData = redata;
            return true;
          }
        }
      }
    });
    return newData;
  };

  return {
    organizationList,
    authInfo,
    mqttInfo,
    userInfo,
    currentUserType,
    currentOrganization,
    currentEnv,
    updateOrganizationList,
    updateOrganization,
    updateRecentlyLoginInfo,
    updateToken,
    updateAuthInfo,
    updateMqttInfo,
    updateUserInfo,
    updateUserType,
    changeIdentity,
    changeIdentityThenNotify,
    changeIdentityThenNotifyWx,
    clearAllData,
    verifyLogin,
    findRecentlyLoginOrganizationInfo,
    refreshToken,
    refreshTokenOnExpire,
    refreshOrganizationListHandle,
  };
});
