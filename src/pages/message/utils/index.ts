import { getOpenApiCode } from '@/services/openapi';
import type { ListItem } from '@/services/systemMessages';
import { loginStore } from '@/store/modules/login';
import { ETargetType, IApplication } from '@/store/modules/workbench';
import { goToApplicationFromMsg } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { pick } from '@/utils/lodash-es';
import { clientType, log } from '@/utils/tools';
import track from '@/utils/track';
import dayjs from 'dayjs';

import {
  accessAlarmCode,
  behaviorAlarmCode,
  faceAlarmCode,
  fireSafetyCode,
} from '@/pages/message/utils/constant';

/**
 * 列表时间格式化
 * @param timestamp
 * 今天，显示时分“xx:xx”
 * 昨天，显示“昨天xx:xx”
 * 前天及今年，显示“xx月xx日”
 * 跨年时，显示“xxxx年xx月xx日”
 * @returns
 */
export const timeFormat = (timestamp: string | number) => {
  // 传入时间对象
  const time = dayjs(timestamp);
  // 今天
  const today = dayjs();
  if (today.startOf('day').isBefore(time) && today.endOf('day').isAfter(time))
    return time.format('HH:mm');
  // 昨天
  const yesterday = dayjs().subtract(1, 'day');
  if (yesterday.startOf('day').isBefore(time) && yesterday.endOf('day').isAfter(yesterday))
    return `昨天 ${time.format('HH:mm')}`;
  // 前天及今年
  if (dayjs().startOf('year').isBefore(time) && yesterday.startOf('day').isAfter(time))
    return time.format('MM-DD');
  return dayjs(timestamp).format('YYYY-MM-DD');
};

// 详情时间格式化
export const detailTimeFormat = (timestamp: string | number) =>
  dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');

// 告警条件转换
export const contentTool = (data: Record<string, any>, explain: boolean) => {
  const { abilityType, desc } = data;
  const descMap = desc?.split(')');
  const descData = descMap && descMap.length > 1 ? descMap.slice(1, descMap.length) : descMap;
  let temp = '';
  if (abilityType === 1) {
    temp = `${explain ? '属性: ' : ''}${descData}`;
  } else if (abilityType === 2) {
    temp = `${explain ? '事件: ' : ''}${descData}`;
  }
  return temp;
};

export const handlePageJumps = (item: ListItem & { iconType: string; [k: string]: any }) => {
  const loginSt = loginStore();
  const isGuardian = EUserType.teacher !== loginSt.currentUserType;
  const appKindName = isGuardian ? 'guardian' : 'teacher';
  const pageMap: Record<string, string> = {
    WXA: 'wxaPage',
    APP: 'appPage',
  };
  const pageKey = pageMap[clientType];
  const pageJumpMap: Record<string, () => boolean> = {
    alarm: () => {
      log('alarmData : ', item.bizDataJson);
      const alarmData = JSON.parse(item.bizDataJson);
      if (
        faceAlarmCode.includes(alarmData.alarmTypeCode) ||
        behaviorAlarmCode.includes(alarmData.alarmTypeCode)
      ) {
        // 人员布控
        // 行为布控
        const detail = JSON.stringify(pick(item, ['bizDataJson']));
        const path = `/app-school-safe/ai-control/detail?detail=${detail}`;
        const params = { path: path } as IApplication;
        params.target = ETargetType.TargetTypeNative;
        goToApplicationFromMsg(params);
      } else if (fireSafetyCode.includes(alarmData.alarmTypeCode)) {
        // 消防安全
        const detail = JSON.stringify(pick(item, ['bizDataJson']));
        const path = `/app-school-safe/fire-safety/detail?detail=${detail}`;
        const params = { path: path } as IApplication;
        params.target = ETargetType.TargetTypeNative;
        goToApplicationFromMsg(params);
      } else if (accessAlarmCode.includes(alarmData.alarmTypeCode)) {
        // 出入管理
        const detail = JSON.stringify(pick(item, ['bizDataJson']));
        const path = `/app-school-safe/access-management/alarm-detail?detail=${detail}`;
        const params = { path: path } as IApplication;
        params.target = ETargetType.TargetTypeNative;
        goToApplicationFromMsg(params);
      } else {
        // 告警消息
        const detail = JSON.stringify(pick(item, ['bizCode', 'bizDataJson']));
        const path = `/pages/notification/alarm-detail?detail=${detail}`;
        const params = { path: path } as IApplication;
        goToApplicationFromMsg(params);
      }
      return true;
    },
    // 离园接送(兼容旧基座)
    pickup: () => {
      const bizDataJson = JSON.parse(item.bizDataJson);
      const id =
        EUserType.teacher === loginSt.currentUserType ? bizDataJson.clazzId : bizDataJson.studentId;
      const path = `/subPackages/return-service/index?id=${id}&locationId=${item.locationId}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 养成打卡
    clockIn: () => {
      const bizDataJson = JSON.parse(item.bizDataJson);
      const taskId = bizDataJson.taskId;
      const locationId = bizDataJson.locationId;
      const path =
        EUserType.teacher !== loginSt.currentUserType
          ? `/app-preprimary-education/clock-in/guardian/detail/index?taskId=${taskId}&locationId=${locationId}`
          : `/app-preprimary-education/clock-in/teacher/detail/index?id=${taskId}&locationId=${locationId}&clazzId=null`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    // 学生请假
    studentLeave: () => {
      const bizDataJson = JSON.parse(item.bizDataJson);
      const leaveId = bizDataJson.leaveId;
      log('leaveId : ', leaveId);
      const path = `/student-leave/detail?leaveId=${leaveId}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 宿舍考勤
    attendance: () => {
      const detail: any = pick(item, ['bizDataJson']);
      const data = JSON.parse(detail?.bizDataJson);
      const { userType, areaId, clazzId, pushTime, signType, studentId, frequency } = data || {};
      const path = `/dormitory-attendance/attendance-detail?userType=${userType}&areaId=${areaId}&clazzId=${clazzId}&pushTime=${pushTime}&signType=${signType}&studentId=${studentId}&frequency=${frequency}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 安全巡检
    patrolManagement: () => {
      const detail: any = pick(item, ['bizDataJson']);
      const data = JSON.parse(detail?.bizDataJson);
      const { planType, taskId, pointId } = data || {};
      const path = `/patrol-management/detail?taskId=${taskId}&pointId=${pointId}&planType=${planType}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 出入管理、出校入校通知
    accessNotification: () => {
      const detail: any = pick(item, ['bizDataJson']);
      const data = JSON.parse(detail?.bizDataJson);
      const { id, locationId, title } = data || {};
      const path = `/app-school-safe/access-management/alarm-notification-detail?id=${id}&locationId=${locationId}&title=${title}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    // 消息订阅
    reportSubscribe: () => {
      const detail = pick(item, [
        'title',
        'createTime',
        'content',
        'attachmentId',
        'attachmentName',
        'bizDataJson',
      ]);
      const data = JSON.parse(detail?.bizDataJson);
      const { reportId, reportBizCode } = data;
      if (reportBizCode === 'Report:AiSceneDaily') {
        const path = `/app-school-safe/ai-control/report?reportId=${reportId}`;
        const params = { path: path } as IApplication;
        params.target = ETargetType.TargetTypeNative;
        goToApplicationFromMsg(params);
      } else {
        // 报表订阅
        const path = `/app-platform/message/report-subscribe?detail=${JSON.stringify(detail)}`;
        const params = { path: path } as IApplication;
        params.target = ETargetType.TargetTypeNative;
        goToApplicationFromMsg(params);
      }
      return true;
    },
    // 上下车通知
    schoolBus: () => {
      const detail = pick(item, ['bizDataJson']);
      const path = `/school-bus/guardian/index?detail=${JSON.stringify(detail)}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    inform: () => {
      return false;
    },
    // 工单中心
    workOrder: () => {
      const detail = pick(item, ['bizDataJson']);
      const { woId } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/subPackages/work-order/detail/index?id=${woId}&detailType=-1`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 每日健康
    healthDay: () => {
      const detail = pick(item, ['bizDataJson']);
      const { id } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/app-preprimary-education/everyday-task/widget/inspection-record/detail?id=${id}`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    // 服药管理
    medicationRegister: () => {
      const detail = pick(item, ['bizDataJson']);
      const path =
        EUserType.teacher === loginSt.currentUserType
          ? `/app-preprimary-education/feed-medicine/teacher/index`
          : `/app-preprimary-education/feed-medicine/guardian/index`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    // 时光集
    timeImpression: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId } = JSON.parse(detail.bizDataJson || '{}');
      // const url = `/subPackages/time-impression/view-picture?id=${studentId}&type=timeset&from=parent`;
      const path = `/app-preprimary-education/time-impression/view-picture?id=${studentId}&type=timeset&from=parent`;
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    healthCollection: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId, workId } = JSON.parse(detail.bizDataJson || '{}');

      const url = `/subPackages/health-collection/collect/index?id=${workId}&studentId=${studentId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    // 学生考勤
    studentAttendance: () => {
      const detail = pick(item, ['bizDataJson']);
      const { clazzId, clazzName, pushTime } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/student-attendance/index?clazzId=${clazzId}&clazzName=${clazzName}&pushTime=${pushTime}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 课堂考勤
    classroomAttendance: () => {
      const detail = pick(item, ['bizDataJson']);
      const { id, studentId } = JSON.parse(detail.bizDataJson || '{}');
      // const url =
      //   appKind === 'teacher'
      //     ? `/subPackages/classroom-attendance/attendance-detail?attendanceId=${id}`
      //     : `/subPackages/classroom-attendance/student-detail?attendanceId=${id}&studentId=${studentId}`;
      const path = `/subPackages/classroom-attendance/attendance-detail?attendanceId=${id}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 家校通讯入班申请
    jiaxiaotongxun: () => {
      const url = `/app-platform/contacts/entry-application/index`;
      uni.navigateTo({ url });
      return true;
    },
    // 家校通知
    homeSchoolNotice: () => {
      const { noticeStudentId } = JSON.parse(item.bizDataJson || '{}');
      const path = `/subPackages/home-school-notice/detail/index?noticeStudentId=${
        noticeStudentId || ''
      }`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 成长评价
    growthEvaluation: () => {
      const { id, subTaskId, studentId, endTime } = JSON.parse(item.bizDataJson || '{}');
      const path =
        EUserType.teacher === store.currentUserType
          ? `/subPackages/growth-evaluation/teacher/evaluation-task-detail/index?id=${id}`
          : `/subPackages/growth-evaluation/guardian/evaluation-detail/index?subTaskId=${subTaskId}&studentId=${studentId}&&endTime=${
              endTime || 0
            }&parentFlag=1`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 访客预约
    visitorAppointment: () => {
      const detail = pick(item, ['bizDataJson']);
      const { id } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/subPackages/visitor-appointment/info/apply-info?id=${id}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    dutyRoster: () => {
      const url = '/subPackages/duty-roster/index';
      uni.navigateTo({
        url,
      });
      return true;
    },
    consumeCenterAccount: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId } = JSON.parse(detail.bizDataJson || '{}');
      let url = '/subPackages/consume-center/index';
      if (EUserType.teacher !== loginSt.currentUserType) url += `?id=${studentId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    consumeCenterCard: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId } = JSON.parse(detail.bizDataJson || '{}');
      let url = '/subPackages/consume-center/operator-record';
      if (EUserType.teacher !== loginSt.currentUserType) url += `?personId=${studentId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    electronicCard: () => {
      const detail = pick(item, ['bizDataJson']);
      const { recordId } = JSON.parse(detail.bizDataJson || '{}');
      const url = `/safety-electronic-card/pages/alarm-detail?recordId=${recordId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    studentArchive: () => {
      const detail = pick(item, ['bizDataJson']);
      const { recordId } = JSON.parse(detail.bizDataJson || '{}');
      const url = `/student-archive/alarm-detail?recordId=${recordId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    // 录播-云上课堂-详见lessonNoticeCode
    lessonNotice: () => {
      const detail = pick(item, ['bizDataJson']);
      const { lessonId, lessonType, personId, personName, teacherId } = JSON.parse(
        detail.bizDataJson || '{}',
      );
      const urlParamsStr = `notice=1&lessonId=${lessonId}&lessonType=${lessonType}&personId=${personId}&personName=${personName}&teacherId=${teacherId}`;
      const path = `/intelligent-recording/classroom-on-cloud/doraemon-h5/index?${urlParamsStr}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 录播-云上课堂-详见lessonCancelNoticeCode
    lessonCancelNotice: () => {
      const path = `/intelligent-recording/classroom-on-cloud/doraemon-h5/index`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 录播-资源管理-详见resourceNoticeCode
    resource: () => {
      const detail = pick(item, ['bizDataJson']);
      const { resourceId } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/intelligent-recording/resource-management/doraemon-h5/index?resourceId=${resourceId}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    // 录播-在线教研-详见teachingResearchOnlineCode
    teachingResearchOnline: () => {
      const detail = pick(item, ['bizDataJson']);
      const { teacherId, lessonId, lessonType } = JSON.parse(detail.bizDataJson || '{}');
      const urlParamsStr = `teacherId=${teacherId}&lessonId=${lessonId}&lessonType=${lessonType}`;
      const path = `/intelligent-recording/teaching-research-online/doraemon-h5/index?${urlParamsStr}`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
    onekeyAlarm: () => {
      const detail = pick(item, ['bizDataJson']);
      const { recordId } = JSON.parse(detail.bizDataJson || '{}');
      const url = `/subPackages/onekey-alarm/alarm-detail?recordId=${recordId}`;
      uni.navigateTo({
        url,
      });
      return true;
    },
    // 安全教育
    safetyEducation: () => {
      const detail = pick(item, ['bizDataJson']);
      const { id, scheduleId, date, gradeId, clazzId, clazzName } = JSON.parse(
        detail.bizDataJson || '{}',
      );
      if (EUserType.teacher === store.currentUserType) {
        const query = [
          `id=${id}`,
          `scheduleId=${scheduleId}`,
          `date=${date}`,
          `gradeId=${gradeId}`,
          `clazzId=${clazzId}`,
          `clazzName=${encodeURIComponent(clazzName)}`,
        ].join('&');

        const path = `/subPackages/safety-education/teacher/report/index?${query}`;
        const params = { path: path } as IApplication;
        goToApplicationFromMsg(params);
      } else {
        const path = `/subPackages/safety-education/guardian/letter/index?id=${id}`;
        const params = { path: path } as IApplication;
        goToApplicationFromMsg(params);
      }

      return true;
    },
    sportsClockin: () => {
      const detail = pick(item, ['bizDataJson']);
      const { taskId, studentId } = JSON.parse(detail.bizDataJson || '{}');
      uni.navigateTo({
        url: `/sports-clockin/guardian/details/index?taskId=${taskId}&studentId=${studentId}`,
      });

      return true;
    },
    // 疾病管理
    sickness: () => {
      uni.navigateTo({
        url: `/app-preprimary-education/disease-management/guardian/index`,
      });

      return true;
    },
    // 视力健康
    visionHealth: () => {
      const path = '/app-intelligent-iot/vision-health/pages/check/index';
      const params = { path: path } as IApplication;
      params.target = ETargetType.TargetTypeNative;
      goToApplicationFromMsg(params);
      return true;
    },
    schoolOver: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId } = JSON.parse(detail.bizDataJson || '{}');
      uni.navigateTo({
        url: `/subPackages/school-over-transfer/guardian/index?id=${studentId}`,
      });

      return true;
    },
    // 视力自测
    visionSelfTest: () => {
      const detail = pick(item, ['bizDataJson']);
      const { studentId } = JSON.parse(detail.bizDataJson || '{}');
      getOpenApiCode(studentId).then(res => {
        uni.navigateToMiniProgram({
          appId: 'wxd408d645fa7dbcc1',
          path: `pages/home/home?code=${res}`,
        });
      });

      return true;
    },
    // 场地预定
    siteReservation: () => {
      const detail = pick(item, ['bizDataJson']);
      const { recordId } = JSON.parse(detail.bizDataJson || '{}');
      const path = `/subPackages/site-reservation/approval-info/index?id=${recordId}&systemMessage=1`;
      const params = { path: path } as IApplication;
      goToApplicationFromMsg(params);
      return true;
    },
  };

  //新基座消息跳转逻辑
  if (item.target && item.path) {
    const params = {
      target: item.target,
      path: item.path,
      code: item.applicationCode,
    } as IApplication;
    goToApplicationFromMsg(params);
    return;
  } else if (item.bizCode === 'Todo:Center' && item.bizDataJson) {
    const bizData = JSON.parse(item.bizDataJson);
    if (bizData && bizData.mobilePagePath) {
      goToApplicationFromMsg({
        target: Number(bizData.mobilePagePath.targetType) || ETargetType.TargetTypeNative,
        path: bizData.mobilePagePath.todo,
        code: bizData.enCode,
      } as IApplication);
      return;
    }
  }

  // 开放通知中心能力（云上课堂）
  if (item[pageKey]) {
    // 兼容旧消息（如果不是原生页面则跳转到webview页面）
    uni.navigateTo({
      url: item[pageKey],
      fail: (err: any) => {
        log(item[pageKey] + ' error : ', err);
        const params = { path: item[pageKey] } as IApplication;
        goToApplicationFromMsg(params);
        uni.$emit('notification-show');
      },
    });
    track('pageview', { appCode: item.applicationCode });
    return;
  }
  log('item.iconType', item);
  // 这里使用iconType来判断跳转？？？
  const jumpResult = pageJumpMap[item.iconType]();
  // 未跳转，详情置为可点击
  if (!jumpResult) {
    uni.$emit('notification-show');
  } else {
    track('pageview', { appCode: item.applicationCode });
  }
};

/**消息未读数：过滤不展示的应用*/
export const getFilterCode = () => {
  return {};
};
