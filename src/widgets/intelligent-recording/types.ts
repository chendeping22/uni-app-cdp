export interface IGetLiveLessons {
  pageNum: number;
  pageSize: number;
}
export interface LiveListItem {
  id: string;
  name: string;
  clazzNames: string;
  startTime: number;
  endTime: number;
  teacherId: number | string;
  teacherName: string;
  spaceId: number;
  introduce: string;
  recording: string;
  enroll: string;
  auditType: string;
  status: LessonLiveStatus;
  publishStatus: string;
  enrollShowStatus: LessonEnrollShowStatus;
  createBy: number;
  creator: string;
  personName: string;
  personId: number | string;
  subjectName: string;
  attachments: Attachments[];
  lessonType: string;
  teacherLocationName: string;
  /**是否为授课端1：是，0：否*/
  forwardDetailFlag?: string;
}
export interface IGetLiveLessonsRtn {
  result: LiveListItem[];
  total: number;
}

/** 附件信息 */
export interface Attachments {
  /**文件id*/
  fileId: LiveTemplateImageEnum;
  /**文件名称*/
  fileName: string;
  /**文件访问地址*/
  fileUrl: string;
  /**文件来源 1-本地，2-上传*/
  fileSource: string;
  /**文件类型 1-封面，2-课件*/
  type: string;
}

/**
 * 报名状态
 * 1：无需报名  2；未报名  3：待审核  4：已同意  5：已驳回
 */
export enum LessonEnrollShowStatus {
  /**无需报名*/
  NOT_REQUIRED = '1',
  /**未报名*/
  REQUIRED = '2',
  /**待审核、已报名*/
  PENDING = '3',
  /**已同意*/
  AGREED = '4',
  /**已驳回*/
  REJECTED = '5',
  /**回放*/
  PLAYBACK = '6',
  /**过期*/
  DELAY = '7',
}

/**
 * 直播状态
 * 1：未开始  2：即将开始  3：直播中  4：已结束
 */
export enum LessonLiveStatus {
  /**未开始*/
  NOT_START = '1',
  /**即将开始*/
  IMMEDIATELY = '2',
  /**直播中*/
  LIVING = '3',
  /**已结束*/
  FINISHED = '4',
  /**直播已暂停——根据业务扩展字段*/
  PAUSE = '5',
  /**恢复 */
  RESUME_LIVE = '6',
}

/** 默认封面枚举 */
export enum LiveTemplateImageEnum {
  Blue = '179f7adb-cc70-48ef-8380-47a7c49f9996',
  Cyan = '370c115c-2785-4310-9b45-d4299a2cf741',
  Green = '5d2e61ab-7f0c-4250-9c11-0fd24bf83f4c',
  Orange = '63a377da-e185-44ce-8042-cf68e8cc22a6',
}

/** 默认封面映射 */
export const liveTemplateImageMap: Record<LiveTemplateImageEnum, string> = {
  [LiveTemplateImageEnum.Blue]: 'live_template_blue',
  [LiveTemplateImageEnum.Cyan]: 'live_template_cyan',
  [LiveTemplateImageEnum.Green]: 'live_template_green',
  [LiveTemplateImageEnum.Orange]: 'live_template_orange',
};

/**课件类型  type: 1-封面，2 - 课件*/
export enum AttachmentType {
  /**封面*/
  COVER = '1',
  /**课件*/
  COURSE_WARE = '2',
}
