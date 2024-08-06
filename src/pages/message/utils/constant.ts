// 会议管理bizCode
export const bizMeetingManageCode = ['meetingManage:reserve'];
// 公文管理bizCode
export const bizMissiveManageCode = ['documentv3'];
/** alarm告警(本期暂时只有告警，未来还有通知等类型) */
export const bizAlarmCode = ['alarm'];
/**
 * 一键报警-告警详情
 */
export const onekeyAlarm = ['One:Click:Alarm'];

/** 归程bizCode集合 */
export const bizPickupCode = ['pickup-teacher', 'Pickup:Parent'];

/** 人脸布控code */
export const faceAlarmCode = ['Person:Control'];

/** 宿舍考勤 bizCode */
export const attendanceCode = ['Dorm:Attendance'];

/** 出入告警code，包括防疫机通行异常以及门禁通行失败 */
export const accessAlarmCode = ['Traffic:Anomaly', 'Traffic:Failed'];

/** 出入管理,出校入校通知 bizCode */
export const accessNotificationCode = ['Student:InOut:School'];

/** 订阅报表 */
export const reportSubscribeCode = ['Report:Subscribe'];

/** 上下车通知 */
export const schoolBusAlarmCode = ['School:Bus:GetIn', 'School:Bus:GetOut'];
/**
 * 场地预定
 */
export const siteReservationCode = ['PlaceReserve:Approve:Notice'];
/**
 * 运动打卡
 */
export const sportsClockinCode = ['SportsClockinNotify'];

/** 滞留通知 */
export const retardCode = ['retard'];

/** 工单中心 */
export const workOrderCode = ['Work:Order'];

/** 每日健康 */
export const healthDayCode = ['Daily:Health'];

/** 服药登记 */
export const medicationRegisterCode = ['Medication:Notice'];

/** 健康采集 */
export const healthCollectionCode = ['Health:Collection:Notice'];

/** 学生考勤 */
export const studentAttendanceCode = ['StudentAttendance:Exception'];
/**
 * 学生画像
 */
export const studentArchiveCode = ['Student:Archive:Miss:Alarm', 'Student:Archive:Danger:Alarm'];

/** 学生请假 bizCode */
export const studentLeaveCode = ['Leave:Faculty:Review'];

/**
 * 课堂考勤
 */
export const classroomAttendanceCode = ['Classroom:Attendance:Notice'];

/** 安全巡检 */
export const patrolManagementCode = ['Patrol:Abnormal'];
/**
 * 安全教育
 */
export const safetyEducationCode = ['SafeEdu:ParentsLetter', 'SafeEdu:TeacherNotify'];

/** 家校通讯录 */
export const homeSchoolCode = ['SchoolFamily:SignInClass'];
/**
 * 家校通知
 */
export const homeSchoolNoticeCode = ['Home:School:Notice'];
/**
 * 放学接送
 */
export const schoolOverCode = ['School:Over:Transfer'];
/**
 * 成长评价
 */
export const growthEvaluationCode = ['Evaluation:Reminder'];
/**
 * 视力自测
 */
export const VisionSelfTesting = ['Vision:Self:Testing'];
/* 
  眼小卫
*/
export const visionScreenCode = ['vision:screen'];
/**
 * 访客预约
 */
export const visitorAppointmentCode = ['Visitor:Appointment', 'Visitor:Access'];
/**
 * 值日表
 */
export const dutyRosterCode = ['Arrange:Schedule:Notice'];
/**
 * 消费中心-账户变动
 */
export const consumeCenterAccountCode = ['Account:Change:Notice', 'Consumption:Notice'];
/**
 * 消费中心-卡变动
 */
export const consumeCenterCardCode = ['Card:Change:Notice'];
/**
 * 时光集
 */
export const timeImpressionCode = ['Timeset:Add:Notice'];
/**
 * 观察记录
 */
export const ObservationRecord = ['Observation:Record'];
/**
 * 成长档案
 */
export const GrowthPortfolio = ['Growth:Portfolio'];
/* 
  疾病管理
*/
export const sicknessCode = ['Disease:Management'];
/**
 * 云上课堂-取消提醒
 */
export const lessonCancelNoticeCode = ['Live:Lesson:Cancel:Notice'];
/*
 * 云上课堂-开始、邀请、审核提醒
 */
export const lessonNoticeCode = [
  'Live:Lesson:Is:About:To:Start:Notice',
  'Live:Lesson:Invite:Notice',
  'Live:Lesson:Registration:Review:Notice',
  'Live:Lesson:Advance:Time:Start:Notice',
  'Live:Lesson:Edit:Publish:StartTime:Notice',
];

/** 打卡bizCode集合 */
export const bizClockInCode = [
  'Clockin:CreateTask:Parent',
  'Clockin:EndTask:Parent',
  'Clockin:DailyReminder:Parent',
  'Clockin:EndTask:Teacher',
];

/**
 * 电子学生证
 */
export const electronicCardCode = [
  'Electronic:Fence:Alarm',
  'Device:Exception:Alarm',
  'SOS:Call:Alarm',
];

// 消防安全 bizCode
export const fireSafetyCode = [
  'WaterPressure:alarm',
  'WaterLevel:alarm',
  'Manual:alarm',
  'Smoke:alarm',
  'Equipment:failure',
  'SuspectedFire:alarm',
];

/**
 * 资源管理-点赞收藏通知、录制资源生成
 */
export const resourceNoticeCode = [
  'Resource:Collection:Notice',
  'Resource:Likes:Notice',
  'Resource:Generated:Notice',
];

/*
 * 线上教研
Teaching:Activities:Publish:Notice,   教研安排提醒
Teaching:Activities:Is:About:To:Start:Notice,   线上教研即将开始提醒"
Teaching:Activities:Cancel:Notice,   线上教研取消提醒"
Teaching:Activities:Invite:Notice,   云线上教研邀请通知"
 */
export const teachingResearchOnlineCode = [
  'Teaching:Activities:Publish:Notice',
  'Teaching:Activities:Is:About:To:Start:Notice',
  'Teaching:Activities:Cancel:Notice',
  'Teaching:Activities:Invite:Notice',
];

export enum BehaviorMonitorEnum {
  AREA_INVASION = 'Area:Invasion', // 区域入侵
  LINGER_ABOUT = 'Linger:About', // 定点徘徊
  PERSONNEL_CONGESTION = 'Personnel:Congestion', // 人员拥堵
  NONSTANDARD_KITCHEN = 'Nonstandard:Kitchen', // 厨房不规范
  SMOKING_ALARM = 'Smoking:Alarm', // 吸烟告警
  CHANNEL_BLOCKAGE = 'Channel:Blockage', // 通道堵塞
  ILLEGAL_STOP = 'Illegal:Stop', // 车辆违停
  LEAVE_WORKPLACE = 'Leave:WorkPlace', // 离岗告警
  LIEDOWN_ALARM = 'LieDown:alarm', // 人员跌倒
  ANIMAL_ALARM = 'Animal:alarm', // 宠物识别
  NOT_WEAR_MASK = 'Not:Wear:Mask', // 不佩戴口罩
  WITHOUT_PERMISSION = 'Without:Permission', // 未授权进入
  ANTI_BULLYING_MONITORING = 'Anti:Bullying:Monitoring', // 防欺凌监测
  FIGHT_MONITOR = 'Fight:Monitor', // 智能布控-疑似打架
  VIOLENCE_DETECT = 'Violence:Detect', // AI布控-疑似打架
  CLIMBING_DETECTION = 'Climbing:Detection', // 攀爬检测
  OVER_WALL_DETECTION = 'Over:Wall:Detection', // 翻墙检测
  CHAIR_DETECTION = 'Chair:Detection', // AI布控-椅子检测
  RUNNING_DETECTION = 'Running:Detection', // 智能布控-奔跑检测
}

// 行为布控code
export const behaviorAlarmCode = [
  BehaviorMonitorEnum.AREA_INVASION,
  BehaviorMonitorEnum.LINGER_ABOUT,
  BehaviorMonitorEnum.PERSONNEL_CONGESTION,
  BehaviorMonitorEnum.NONSTANDARD_KITCHEN,
  BehaviorMonitorEnum.NOT_WEAR_MASK,
  BehaviorMonitorEnum.SMOKING_ALARM,
  BehaviorMonitorEnum.CHANNEL_BLOCKAGE,
  BehaviorMonitorEnum.ILLEGAL_STOP,
  BehaviorMonitorEnum.WITHOUT_PERMISSION,
  BehaviorMonitorEnum.LEAVE_WORKPLACE,
  BehaviorMonitorEnum.LIEDOWN_ALARM,
  BehaviorMonitorEnum.ANIMAL_ALARM,
  BehaviorMonitorEnum.FIGHT_MONITOR,
  BehaviorMonitorEnum.VIOLENCE_DETECT,
  BehaviorMonitorEnum.ANTI_BULLYING_MONITORING,
  BehaviorMonitorEnum.CLIMBING_DETECTION,
  BehaviorMonitorEnum.OVER_WALL_DETECTION,
  BehaviorMonitorEnum.CHAIR_DETECTION,
  BehaviorMonitorEnum.RUNNING_DETECTION,
];

/** 消息对应的groupType */
export const originIconTypeMap: Record<string, string> = {
  meetingManage: 'meetingManage',
  alarm: 'alarm',
  pickup: 'pickup',
  clockIn: 'clockIn',
  schoolBus: 'schoolBus',
  reportSubscribe: 'reportSubscribe',
  studentAttendance: 'studentAttendance',
  leaveFaculty: 'studentLeave',
  workFlow: 'workOrder',
  schoolFamily: 'jiaxiaotongxun',
  dormAttendance: 'attendance',
  placeReserve: 'placeReserve',
  consumptionManagement: 'consumeCenterAccount',
  // #ifndef MP-WEIXIN
  teachingActivities: 'teachingActivities',
  resourceManagement: 'resourceManagement',
  // #endif
  electronicStudentIDCard: 'electronicStudentIDCard',
  classroomAttendance: 'classroomAttendance',
  dailyHeath: 'healthDay',
  growthEvaluation: 'growthEvaluation',
  visionSelfTest: 'visionSelfTest',
  visitorManage: 'visitorAppointment',
  passInOutManage: 'accessNotification',
  homeSchoolNotice: 'homeSchoolNotice',
  patrolManage: 'patrolManagement',
  timeSet: 'timeSet',
  arrangeSchedule: 'dutyRoster',
  safetyEducation: 'safetyEducation',
  sportsClockIn: 'sportsClockin',
  sickness: 'sickness',
  'vision:screen': 'visionHealth',
  afterSchool: 'schoolOver',
  instrumentManage: 'instrumentManage',
};
