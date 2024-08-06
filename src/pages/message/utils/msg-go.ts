import { findByUserId, getUserType } from '@/services/user';
import { IOrganizationInfo, loginStore } from '@/store/modules/login';
import { IApplication } from '@/store/modules/workbench';
import { goToApplicationFromMsgUseReLaunch } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { isNil } from '@/utils/lodash-es';
import { log, showInfo } from '@/utils/tools';
import * as sentry from 'sentry-mina';

export const wxMessage = async (
  userId: string,
  userType: string,
  locationId: string,
  redirectUrl: string,
  callback?: Function,
  diffAccountCallback?: Function,
) => {
  const store = loginStore();
  // 消息 1-教职工，2-学生，家长
  // 移动端 0教职工 1学生 2家长
  // userId换uesrType
  userType = await getRealUserType(userType, userId);
  log('real_userType : ' + userType + ', current_userType : ' + store.currentUserType);

  // 如果消息与当前人不在同一端, 尝试切换组织
  if (store.currentUserType + '' !== userType) {
    changeLocationSimple(
      userId,
      userType,
      locationId,
      redirectUrl,
      () => {
        callback && callback();
      },
      () => {
        setTimeout(() => {
          showInfo('该消息与当前账号不符');
        }, 500);
        diffAccountCallback && diffAccountCallback();
      },
    );
  } else {
    const isSameAccount = await checkSameAccount(userType, userId);
    log('isSameAccount : ', isSameAccount);
    if (isSameAccount) {
      msgGo(locationId, userType, userId, redirectUrl, () => {
        callback && callback();
      });
    } else {
      setTimeout(() => {
        showInfo('该消息与当前账号不符');
      }, 500);
      diffAccountCallback && diffAccountCallback();
    }
  }
};

export const changeLocationSimple = async (
  userId: string,
  userType: string,
  locationId: string,
  redirectUrl: string,
  errCallback?: Function,
  diffAccountCallback?: Function,
) => {
  try {
    const store = loginStore();
    let findOrganization = undefined;
    log('organizationList : ', store.organizationList?.locations);
    for (const value of store.organizationList?.locations) {
      if (value.userType != Number(userType)) {
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
      errCallback && errCallback();
    } else {
      try {
        const identity = await store.changeIdentity(Number(userType), findOrganization);
        log('切换成功1', identity);
        const isSame = await checkSameAccount(userType, userId);
        log('checkSameAccount : ', isSame);
        if (isSame) {
          msgGo(locationId, userType, userId, redirectUrl, () => {
            errCallback && errCallback();
          });
        } else {
          diffAccountCallback && diffAccountCallback();
        }
      } catch (error) {
        errCallback && errCallback();
      }
    }
  } catch (err) {
    log('切换组织失败：', err);
    errCallback && errCallback();
  }
};

export const findOrganizationInfo = (
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

/**
 * 消息归属
 * @param msgUserType 消息的userType
 * @param msgUserId 消息的userId
 * @returns
 */
export const checkSameAccount = async (msgUserType: string, msgUserId: string) => {
  const store = loginStore();
  // 取出当前用户的账号ID
  const userAccountId = store.userInfo?.accountId ?? store.userInfo?.id;
  log('userAccountId : ' + userAccountId);
  if (msgUserType === EUserType.teacher + '') {
    // B端（老师）
    try {
      const { id } = await findByUserId(msgUserId);
      log('accountId : ' + id + ', current accountId : ' + userAccountId);
      if (!id || id !== userAccountId) {
        log('该消息与当前账号不符');
        return false;
      }
    } catch (err: any) {
      log('findByUserId_error : ', err);
      return false;
    }
  } else {
    // C端
    try {
      const { id } = await getUserType(msgUserId);
      log('id : ' + id + ', current id : ' + userAccountId);
      if (!id || id !== userAccountId) {
        log('该消息与当前账号不符');
        return false;
      }
    } catch (err: any) {
      log('getUserType_error : ', err);
      return false;
    }
  }

  return true;
};

/**
 * 消息的userType要转成用户userType
 * @param msgUserType 消息的userType
 * @param msgUserId 消息的userId
 * @returns
 */
export const getRealUserType = async (msgUserType: string, msgUserId: string) => {
  if (msgUserType === '1') {
    // B端（老师）
    return EUserType.teacher + '';
  } else {
    // C端
    try {
      const { userIdentity } = await getUserType(msgUserId);
      if (userIdentity) {
        return userIdentity + '';
      }
    } catch (err: any) {
      log('getUserType_error : ', err);
    }
  }
  return msgUserType;
};

/**
 * 消息切组织跳转
 * @param locationId 消息locationId
 * @param userType userType
 * @param userId 消息userId
 * @param redirectUrl 消息地址
 * @param callback
 */
export const msgGo = async (
  locationId: string,
  userType: string,
  userId: string,
  redirectUrl: string,
  callback?: Function,
) => {
  // 兼容多个userType的问题
  if (redirectUrl.includes('userType')) {
    log('redirectUrl_for_change : ', redirectUrl);
    redirectUrl = redirectUrl.replace(/(&userType=)\d+/, `&userType=${userType}`);
    log('redirectUrl_changed : ', redirectUrl);
  }

  // 如果是相同组织且用户类型一致，无需切换组织
  const store = loginStore();
  log('msgGo ---> userId : ' + userId + ', current-userId : ' + store.userInfo?.userId);
  log(
    'msgGo ---> locationId : ' +
      locationId +
      ', current-locationId : ' +
      store.currentOrganization?.id,
  );
  log('msgGo ---> userType : ' + userType + ', current-userType : ' + store.currentUserType);
  if (
    locationId &&
    locationId === store.currentOrganization?.id &&
    userType &&
    userType === store.currentUserType + ''
  ) {
    uni.reLaunch({
      url: redirectUrl,
      fail: (err: any) => {
        // 跳转失败就回到WebView页面
        log('...... > file: welcome-wx.vue:49 > refreshLogin > err:', err);
        const params = { path: redirectUrl } as IApplication;
        goToApplicationFromMsgUseReLaunch(params);
      },
    });
  } else {
    // 已登录---如果当前组织与消息组织不一致，需要切换组织
    if (locationId && (userId || userType)) {
      try {
        await store.changeIdentityThenNotifyWx(userId, userType, locationId, () => {
          // 优先走原生路由，如果失败走webview页面
          sentry.captureException({
            event: 'pushChangeIdentifyResult',
            userId: userId,
            userType: userType,
            locationId: locationId,
            desc: 'welcome-wx切换组织成功, 去消息详情页',
          });
          uni.reLaunch({
            url: redirectUrl,
            fail: (err: any) => {
              // 跳转失败就回到WebView页面
              log('...... > file: welcome-wx.vue:49 > refreshLogin > err:', err);
              const params = { path: redirectUrl } as IApplication;
              goToApplicationFromMsgUseReLaunch(params);
            },
          });
        });
      } catch (err) {
        log('切换组织失败：', err);
        sentry.captureException({
          event: 'pushChangeIdentifyResult',
          userId: userId,
          userType: userType,
          locationId: locationId,
          desc: 'welcome-wx切换组织失败, 去登录页:' + JSON.stringify(err),
        });
        callback && callback();
        setTimeout(() => {
          showInfo('该账号暂无权限');
        }, 500);
      }
    } else {
      // 没有带userType的条件下，尝试教职切换组织，如果不成功再切换家长组织
      let firstCheckUserType = EUserType.teacher + '';
      let secondCheckUserType = EUserType.guardian + '';
      if (redirectUrl.indexOf('guardian') !== -1) {
        // 家长
        firstCheckUserType = EUserType.guardian + '';
        secondCheckUserType = EUserType.teacher + '';
      }
      log('不满足组织切换条件，尝试' + firstCheckUserType + '切换组织');
      sentry.captureException({
        event: 'pushChangeIdentifyResult',
        userId: userId,
        userType: userType,
        locationId: locationId,
        desc: 'welcome-wx不满足组织切换条件, 尝试' + firstCheckUserType + '切换组织',
      });
      try {
        await store.changeIdentityThenNotifyWx('', firstCheckUserType, locationId, () => {
          // 优先走原生路由，如果失败走webview页面
          sentry.captureException({
            event: 'pushChangeIdentifyResult',
            userId: userId,
            userType: userType,
            locationId: locationId,
            desc: 'welcome-wx切换' + firstCheckUserType + '组织成功, 去消息详情页',
          });
          uni.reLaunch({
            url: redirectUrl,
            fail: (err: any) => {
              // 跳转失败就回到WebView页面
              log('...... > file: welcome-wx.vue:49 > refreshLogin > err:' + JSON.stringify(err));
              const params = { path: redirectUrl } as IApplication;
              goToApplicationFromMsgUseReLaunch(params);
            },
          });
        });
      } catch (err) {
        log('尝试' + firstCheckUserType + '切换组织失败：', err);
        sentry.captureException({
          event: 'pushChangeIdentifyResult',
          userId: userId,
          userType: userType,
          locationId: locationId,
          desc: 'welcome-wx尝试' + firstCheckUserType + '切换组织失败: ' + JSON.stringify(err),
        });
        log(firstCheckUserType + '切换组织失败，尝试' + secondCheckUserType + '换组织');
        sentry.captureException({
          event: 'pushChangeIdentifyResult',
          userId: userId,
          userType: userType,
          locationId: locationId,
          desc:
            'welcome-wx' +
            +firstCheckUserType +
            '切换组织失败, 尝试' +
            secondCheckUserType +
            '换组织',
        });
        try {
          await store.changeIdentityThenNotifyWx('', secondCheckUserType, locationId, () => {
            // 优先走原生路由，如果失败走webview页面
            sentry.captureException({
              event: 'pushChangeIdentifyResult',
              userId: userId,
              userType: userType,
              locationId: locationId,
              desc: 'welcome-wx切换' + secondCheckUserType + '组织成功, 去消息详情页',
            });
            uni.reLaunch({
              url: redirectUrl,
              fail: (err: any) => {
                // 跳转失败就回到WebView页面
                log('...... > file: welcome-wx.vue:49 > refreshLogin > err:' + JSON.stringify(err));
                const params = { path: redirectUrl } as IApplication;
                goToApplicationFromMsgUseReLaunch(params);
              },
            });
          });
        } catch (err) {
          log('尝试' + secondCheckUserType + '切换组织失败：', err);
          sentry.captureException({
            event: 'pushChangeIdentifyResult',
            userId: userId,
            userType: userType,
            locationId: locationId,
            desc: 'welcome-wx尝试' + secondCheckUserType + '切换组织失败: ' + JSON.stringify(err),
          });
          callback && callback();
          setTimeout(() => {
            showInfo('该账号暂无权限');
          }, 500);
        }
      }
    }
  }
};
