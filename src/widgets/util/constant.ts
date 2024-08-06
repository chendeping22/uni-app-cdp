/**
 * 小组件类型
 */
export enum WidgetType {
  /**
   * 移动端工作台 / 学生考勤
   */
  WidgetType_StudentAttendance = 'StudentAttendance',
  /** 移动端工作台 / AI布控 -- 今日告警数量 */
  WidgetType_TodayAiAlarmTotal = 'TodayAiAlarmTotal',
  /** 移动端工作台 / AI布控 -- 今日告警占比 */
  WidgetType_TodayAiAlarmProportion = 'TodayAiAlarmProportion',
  /** 移动端工作台 / AI布控 -- 今日告警统计 */
  WidgetType_TodayAiAlarmSituation = 'TodayAiAlarmSituation',
  /** 移动端工作台 / 教务 -- 考勤打卡 */
  WidgetType_StaffLockIn = 'StaffLockIn',
  /** 移动端工作台 / 教务 -- 考勤统计 */
  WidgetType_StaffAttendance = 'StaffAttendance',
  /** 待办中心 */
  WidgetType_TodoCenter = 'TodoCenter',
  /** 移动端工作台 / 一日三检 */
  WidgetType_DayThreeInspection = 'DayThreeInspection',
  /** 移动端工作台 / 今日学生请假情况 */
  WidgetType_TodayStudentLeaveSituation = 'TodayStudentLeaveSituation',
  /** 移动端工作台 / 学生请假审批情况 */
  WidgetType_StudentLeaveApprovalSituation = 'StudentLeaveApprovalSituation',
  /** 移动端工作台 / 今日场地预定情况 */
  WidgetType_SiteReservation = 'SiteReservation',
  /** 移动端工作台 / 访客预约 */
  WidgetType_VisitorAppointment = 'VisitorAppointment',
  /** 移动端工作台 / 物联 -- 设备监测 */
  WidgetType_DevicesRealtimeStatus = 'DevicesRealtimeStatus',
  /** 移动端工作台 / 物联 -- 设备开启情况 */
  WidgetType_DevicesOpenSituations = 'DevicesOpenSituation',
  /** 移动端工作台 / 物联 -- 教室能耗排行TOP5 */
  WidgetType_ClassroomEnergyConsumptionLeaderboard = 'ClassroomEnergyConsumptionLeaderboard',
  /** 移动端工作台 / 养成打卡 */
  WidgetType_ClockIn = 'ClockIn',
  /** 移动端工作台 / 离园接送 */
  WidgetType_ReturnProcess = 'ReturnProcess',
  /** 移动端工作台 / 录播 -- 当前直播课程 */
  WidgetType_LiveLessonBoard = 'LiveLessonBoard',
  /** 移动端工作台 / 家校端 家校通知 */
  WidgetType_HomeSchoolNotice = 'HomeSchoolNotice',
  /** 移动端工作台 / 家校端 课表 */
  WidgetType_PersonalCourse = 'PersonalCourse',
  /** 移动端工作台 / 课表 */
  WidgetType_CurriculumSchedule = 'CurriculumSchedule',
  /** 移动端工作台 / 办公效能 **/
  WidgetType_OfficeEfficacy = 'OfficeEfficacy',
  /** 移动端工作台 /公文管理 */
  WidgetType_MissiveManager = 'MissiveManager',
  /** 移动端工作台 /会议安排 */
  WidgetType_MeetingManage = 'MeetingManage',
}
