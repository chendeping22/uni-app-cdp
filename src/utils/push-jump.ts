import { getFilterCode } from '@/pages/message/utils';
import {
  accessAlarmCode,
  behaviorAlarmCode,
  faceAlarmCode,
  fireSafetyCode,
} from '@/pages/message/utils/constant';
import {
  checkSameAccount,
  findOrganizationInfo,
  getRealUserType,
} from '@/pages/message/utils/msg-go';
import {
  IUnreadNumParamsFilter,
  getUnreadNumByUserFilter,
  markRead,
} from '@/services/systemMessages';
import { jumpStore } from '@/store/modules/jump';
import { loginStore } from '@/store/modules/login';
import { messageStore } from '@/store/modules/message';
import { ETargetType, IApplication } from '@/store/modules/workbench';
import { goToApplicationFromMsg } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { clientType, hideLoading, log, showInfo } from '@/utils/tools';
import { setPageParams } from './tools';

/** 更新app角标数量 */
export const setAppBadgeNum = async (showUnReadNum?: number) => {
  const { brand, platform } = uni.getSystemInfoSync();
  if (!brand) return;
  // 华为(都叫HUAWEI?)与iOS需要处理角标的更新
  if ('ios' === platform || 'HUAWEI' === brand || 'huawei' === brand) {
    const store = loginStore();
    if (store.userInfo?.userId) {
      const params: IUnreadNumParamsFilter = {
        userId: store.userInfo?.userId,
        userType: EUserType.teacher === store.currentUserType ? 1 : 2,
        clientType,
        ...getFilterCode(),
      };
      let unReadNum = showUnReadNum ? showUnReadNum : -1;
      if (unReadNum < 0) {
        unReadNum = await getUnreadNumByUserFilter(params);
      }
      log('setBadgeNumber : ', unReadNum);
      plus.runtime.setBadgeNumber(unReadNum > 99 ? 99 : unReadNum);
    } else {
      plus.runtime.setBadgeNumber(0);
    }
  }
  return;
};

export const goToApplicationByMsg = async (target: any, path: string, notifyId: number) => {
  await markRead(notifyId);
  await setAppBadgeNum();
  const store = messageStore();
  store.setPendingMsgRead(notifyId);
  const params = { target: target, path: path } as IApplication;
  goToApplicationFromMsg(params);
};

export const pushJump = async (msg: any) => {
  const store = jumpStore();
  const { setPushParams } = store;
  const jumpToAlarm = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    // retardCode 暂时不需要迁移
    if (
      faceAlarmCode.includes(msg.payload.alarmTypeCode) ||
      behaviorAlarmCode.includes(msg.payload.alarmTypeCode)
    ) {
      // 人员布控
      // 行为布控
      const detail = JSON.stringify({
        bizDataJson: JSON.stringify(msg.payload),
        locationId: msg.payload.locationId,
        isPushJump: true,
      });
      const path = `/app-school-safe/ai-control/detail?detail=${detail}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
    } else if (fireSafetyCode.includes(msg.payload.alarmTypeCode)) {
      // 消防安全
      const detail = JSON.stringify({
        bizDataJson: JSON.stringify(msg.payload),
        locationId: msg.payload.locationId,
        isPushJump: true,
      });
      const path = `/app-school-safe/fire-safety/detail?detail=${detail}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
    } else if (accessAlarmCode.includes(msg.payload.alarmTypeCode)) {
      // 出入管理
      const detail = JSON.stringify({
        bizDataJson: JSON.stringify(msg.payload),
        locationId: msg.payload.locationId,
        isPushJump: true,
      });
      const path = `/app-school-safe/access-management/alarm-detail?detail=${detail}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
    } else {
      // 告警消息
      const detail = JSON.stringify({
        bizCode: msg.payload.bizCode,
        bizDataJson: JSON.stringify(msg.payload),
        isPushJump: true,
      });
      const path = `/pages/notification/alarm-detail?detail=${detail}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
    }
    setPushParams({});
  };
  // 离园接送
  const jumpToPickup = async () => {
    const id = msg.payload.clazzId;
    const locationId = msg.payload.locationId;

    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();

    const path = `/subPackages/return-service/index?id=${id}&locationId=${locationId}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };
  // 学生请假
  const jumpToStudentLeave = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();

    const leaveId = msg.payload.leaveId;
    const path = `/student-leave/detail?leaveId=${leaveId}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  // 宿舍考勤
  const jumpToAttendance = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { userType, areaId, clazzId, pushTime, signType, studentId, frequency } = msg.payload;
    const path = `/dormitory-attendance/attendance-detail?userType=${userType}&areaId=${areaId}&clazzId=${clazzId}&pushTime=${pushTime}&signType=${signType}&studentId=${studentId}&frequency=${frequency}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  // 场地预定
  const jumpToSiteReservation = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { recordId } = msg.payload;
    const path = `/subPackages/site-reservation/approval-info/index?id=${recordId}&systemMessage=1`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  // 消息订阅
  const receiveSubscrive = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { reportBizCode, reportId } = msg.payload;
    // AI日报
    if (reportBizCode === 'Report:AiSceneDaily') {
      const path = `/app-school-safe/ai-control/report?reportId=${reportId}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      setPushParams({});
    } else {
      // 报表订阅
      const path = `/app-platform/message/report-subscribe?detail=${JSON.stringify(msg.payload)}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      setPushParams({});
    }
  };
  // 滞留告警
  const jumpToRetard = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const detailJson = {
      bizDataJson: JSON.stringify(msg.payload),
    };
    const path = `/pages/notification/alarm-detail?detail=${JSON.stringify(detailJson)}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  const jumpToWorkOrder = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const path = `/subPackages/work-order/detail/index?${setPageParams({
      id: msg.payload.woId,
      detailType: -1,
    })}`;
    goToApplicationFromMsg({ path } as IApplication);
    setPushParams({});
  };

  //  学生考勤
  const jumpToStudentAttendance = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { clazzId, clazzName, pushTime } = msg.payload;
    const path = `/student-attendance/index?clazzId=${clazzId}&clazzName=${clazzName}&pushTime=${pushTime}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  //  课堂考勤
  const jumpToClassroomAttendance = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { id } = msg.payload;
    const path = `/subPackages/classroom-attendance/attendance-detail?attendanceId=${id}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  /** 家长申请加入 */
  const jumpToHomeSchoolEntryApply = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const path = '/app-platform/contacts/entry-application/index';
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };
  /** 每日健康 */
  const jumpToDailyHealth = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { id } = msg.payload;
    const path = `/app-preprimary-education/everyday-task/widget/inspection-record/detail?id=${id}`;
    const params = { path: path } as IApplication;
    params.target = ETargetType.TargetTypeNative;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  /** 成长评价(只有老师) */
  const jumpToGrowthEvaluation = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { id } = msg.payload;
    const path = `/subPackages/growth-evaluation/teacher/evaluation-task-detail/index?id=${id}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  /** 访客预约 */
  const jumpToVisitorAppointment = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { id } = msg.payload;
    const path = `/subPackages/visitor-appointment/info/apply-info?id=${id}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  /** 安全巡检 */
  const jumpPatrolManagement = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { planType, taskId, pointId } = msg.payload;

    const path = `/patrol-management/detail?taskId=${taskId}&pointId=${pointId}&planType=${planType}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  /** 消费中心-统计页面 */
  const jumpToConsumeCenterStatistics = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const appKind = import.meta.env.VITE_COMPOSITION;
    const { studentId } = msg.payload;
    let path = '/subPackages/consume-center/index';
    if (appKind === 'guardian') path += `?id=${studentId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /** 消费中心-卡务记录 */
  const jumpToConsumeCenterOperator = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const appKind = import.meta.env.VITE_COMPOSITION;
    const { studentId } = msg.payload;
    let path = '/subPackages/consume-center/operator-record';
    if (appKind === 'guardian') path += `?personId=${studentId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /** 电子学生证-告警记录 */
  const jumpToElectronicCard = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { recordId } = msg.payload;
    const path = `/safety-electronic-card/pages/alarm-detail?recordId=${recordId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /**学生画像告警 */
  const jumpToStudentArchiveAlarm = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { recordId } = msg.payload;
    const path = `/student-archive/alarm-detail?recordId=${recordId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /** 一键报警-告警记录 */
  const jumpToOnekeyAlarm = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { recordId } = msg.payload;
    const path = `/subPackages/onekey-alarm/alarm-detail?recordId=${recordId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /** 一键报警-呼叫 */
  const jumpToOnekeyAlarmCall = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const path = `/subPackages/onekey-alarm/call?params=${JSON.stringify(msg.payload)}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  /**放学接送 */
  const jumpToSchoolOver = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { studentId } = msg.payload;
    const path = `/subPackages/school-over-transfer/guardian/index?id=${studentId}`;
    uni.navigateTo({
      url: path,
      success: () => {
        setPushParams({});
      },
    });
  };

  //  家校通知
  const jumpToHomeSchoolNotice = async () => {
    await markRead(msg.payload.notifyId);
    await setAppBadgeNum();
    const { noticeStudentId } = msg.payload;
    const path = `/subPackages/home-school-notice/detail/index?noticeStudentId=${noticeStudentId}`;
    const params = { path: path } as IApplication;
    goToApplicationFromMsg(params);
    setPushParams({});
  };

  const jumpMap: Record<string, () => void> = {
    alarm: jumpToAlarm,
    'pickup-teacher': jumpToPickup, // 离园接送（老师）
    'Leave:Faculty:Review': jumpToStudentLeave,
    'Dorm:Attendance': jumpToAttendance, // 宿舍考勤
    'Report:Subscribe': receiveSubscrive,
    retard: jumpToRetard,
    'Work:Order': jumpToWorkOrder,
    'StudentAttendance:Exception': jumpToStudentAttendance,
    'Classroom:Attendance:Notice': jumpToClassroomAttendance,
    'SchoolFamily:SignInClass': jumpToHomeSchoolEntryApply,
    'Daily:Health': jumpToDailyHealth,
    'Evaluation:Reminder': jumpToGrowthEvaluation,
    'Visitor:Appointment': jumpToVisitorAppointment,
    'Visitor:Access': jumpToVisitorAppointment,
    'Patrol:Abnormal': jumpPatrolManagement, // 安全巡检
    'Account:Change:Notice': jumpToConsumeCenterStatistics,
    'Consumption:Notice': jumpToConsumeCenterStatistics,
    'Card:Change:Notice': jumpToConsumeCenterOperator,
    'Electronic:Fence:Alarm': jumpToElectronicCard,
    'Device:Exception:Alarm': jumpToElectronicCard,
    'SOS:Call:Alarm': jumpToElectronicCard,
    'One:Click:Alarm': jumpToOnekeyAlarm,
    'One:Click:Alarm:Call': jumpToOnekeyAlarmCall,
    'School:Over:Transfer': jumpToSchoolOver,
    'Student:Archive:Miss:Alarm': jumpToStudentArchiveAlarm,
    'Student:Archive:Danger:Alarm': jumpToStudentArchiveAlarm,
    'PlaceReserve:Approve:Notice': jumpToSiteReservation,
    'Home:School:Notice': jumpToHomeSchoolNotice,
  };

  log('message payload : ', msg.payload);

  const loginSt = loginStore();
  log('message userId : ' + msg.payload.userId + ', current userId : ' + loginSt.userInfo?.userId);
  // 先用userId判断当前用户身份，如果userId是空的就是非法
  if (!msg?.payload?.userId) {
    setTimeout(() => {
      log('该消息不符合条件');
      showInfo('该消息不符合条件');
    }, 500);
    return;
  }

  // 切换组织
  log(
    'message locationId : ' +
      msg.payload.locationId +
      ', current locationId : ' +
      loginSt.currentOrganization?.id,
  );

  log(
    'msg_userType : ' + msg?.payload?.userType + ', current_userType : ' + loginSt.currentUserType,
  );

  // 消息userType 1-教职工，2-学生，家长
  // 用户userType 0教职工 1学生 2家长
  // userId换uesrType
  const userType = await getRealUserType(msg?.payload?.userType + '', msg?.payload?.userId);
  log('real_userType : ' + userType + ', current_userType : ' + loginSt.currentUserType);

  // 如果消息与当前人不在同一端, 尝试切换组织
  if (loginSt.currentUserType + '' !== userType) {
    try {
      let findOrganization = undefined;
      log('organizationList : ', loginSt.organizationList?.locations);
      for (const value of loginSt.organizationList?.locations) {
        if (value.userType != Number(userType)) {
          continue;
        }
        const info = findOrganizationInfo(msg.payload.locationId, value.locations);
        if (info) {
          findOrganization = info;
          break;
        }
      }
      if (!findOrganization) {
        log('组织树种找不到' + msg.payload.locationId + '组织');
        setTimeout(() => {
          showInfo('该账号暂无权限');
        }, 500);
      } else {
        try {
          const identity = await loginSt.changeIdentity(Number(userType), findOrganization);
          log('切换成功1', identity);
          const isSame = await checkSameAccount(userType, msg?.payload?.userId);
          log('checkSameAccount : ', isSame);
          if (isSame) {
            msgGo(
              msg.payload.locationId + '',
              userType + '',
              msg?.payload?.userId,
              msg.payload.page,
              msg.payload.target,
              msg.payload.path,
              msg.payload.notifyId,
              () => {
                jumpMap[msg.payload.bizCode]();
              },
            );
          } else {
            setTimeout(() => {
              showInfo('该消息与当前账号不符');
            }, 500);
          }
        } catch (error) {}
      }
    } catch (err) {
      log('切换组织失败：', err);
      setTimeout(() => {
        showInfo('该账号暂无权限');
      }, 500);
    }
  } else {
    const isSameAccount = await checkSameAccount(userType, msg?.payload?.userId);
    log('isSameAccount : ', isSameAccount);
    if (isSameAccount) {
      msgGo(
        msg.payload.locationId + '',
        userType + '',
        msg?.payload?.userId,
        msg.payload.page,
        msg.payload.target,
        msg.payload.path,
        msg.payload.notifyId,
        () => {
          jumpMap[msg.payload.bizCode]();
        },
      );
    } else {
      setTimeout(() => {
        showInfo('该消息与当前账号不符');
      }, 500);
    }
  }
};

/**
 * 消息切组织跳转
 * @param locationId 消息locationId
 * @param userType 消息userType
 * @param userId 消息userId
 * @param page page
 * @param target target
 * @param path 消息地址
 * @param notifyId 消息地址
 * @param callback
 */
const msgGo = async (
  locationId: string,
  userType: string,
  userId: string,
  page: string,
  target: string,
  path: string,
  notifyId: number,
  callback?: Function,
) => {
  // 如果是相同组织且用户类型一致，无需切换组织
  const store = loginStore();
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
    hideLoading();
    // 新基座消息跳转逻辑
    if (target && path) {
      goToApplicationByMsg(target, path, notifyId);
      return;
    }
    // 开发通知中心能力（云上课堂）
    if (page) {
      // 兼容旧消息（如果不是原生页面则跳转到webview页面）
      uni.navigateTo({
        url: page,
        fail: (err: any) => {
          log(page + ' error : ', err);
          const params = { path: page } as IApplication;
          goToApplicationFromMsg(params);
        },
      });
      return;
    }
    callback && callback();
  } else {
    try {
      await store.changeIdentityThenNotifyWx(userId, userType, locationId, () => {
        hideLoading();
        uni.reLaunch({
          url: `/pages/workbench/index`,
          success: () => {
            // 新基座消息跳转逻辑
            if (target && path) {
              goToApplicationByMsg(target, path, notifyId);
              return;
            }
            // 开发通知中心能力（云上课堂）
            if (page) {
              // 兼容旧消息（如果不是原生页面则跳转到webview页面）
              uni.navigateTo({
                url: page,
                fail: (err: any) => {
                  log(page + ' error : ', err);
                  const params = { path: page } as IApplication;
                  goToApplicationFromMsg(params);
                },
              });
              return;
            }
            callback && callback();
          },
          fail: (err: any) => {
            log('切换身份失败: ', err);
            if (!err.includes('locked')) {
              showInfo('切换身份失败');
            }
            hideLoading();
          },
        });
      });
    } catch (err) {
      hideLoading();
      log('切换组织失败：', err);
      showInfo('该消息与当前账号不符');
    }
  }
};
