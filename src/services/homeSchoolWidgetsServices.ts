import { request } from '@/utils/request';

export enum UserType {
  IMP = 1,
  CUser = 2,
}

export type IConfirmInfoParams = {
  pageSize: number;
  pageNum: number;
  status: number; // 0未确认  1已确认
  studentId: string;
  studentName?: string;
  clazzIds?: string;
  id?: string; // 通知ID
  userType?: UserType; // 1：IMP用户 2  C端用户  默认是IMP用户
};

export type IConfirmInfoItem = {
  id: string;
  noticeId: string; // 通知ID
  title: string; // 通知标题
  studentId: string; // 学生ID
  studentName: string; // 学生姓名
  parentId: string; // 确认家长ID
  parentName: string; // 确认家长名称
  clazzId: string; // 班级ID
  clazzName: string; // 班级名称
  status: number; // 状态(0、未确认  1、已确认)
  statusName: string; // 状态名称
  locationId: number; // 组织ID
  gradeId: string;
  parentNames: string[]; // 家长姓名
  updateTime: number; // 更新时间
  publishTime: number; // 发布时间
  certificateNumber: string; // 身份证号
  studentCode: string; // 学籍号
  relation: number; // 学生关系(0、父亲；1、母亲；2、爷爷；3、奶奶；4、外公；5、外婆；99、其他)
  relationName: string; // 学生关系名称
  signatureFileId: string; // 签名图片文件id
  signatureFileUrl: string; // 签名图片文件url
  notifyType: string; // 通知类型(1：日常，2：安全，3：假期，4：活动，5：奖惩，6：其他)
  notifyTypeName: string; // 通知类型名称
};

export type IStudentNoticeResp = {
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
  result: IConfirmInfoItem[];
};

/**
 * 学生确认信息分页查询
 * @param IConfirmInfoParams
 * @returns IStudentNoticeResp
 */
export const getConfirmInfo = (data: IConfirmInfoParams) =>
  request<IStudentNoticeResp>('/schoolNotices/actions/findStudentPage', data, 'GET', {
    spaceType: request.service.campus,
    showLoading: false,
  });

export type INoticeDetail = {
  id: string;
  title: string;
  content: string;
  status: number; // 0未确认  1已确认
  statusName: string;
  notifyType: string; // 通知类型 (1：日常，2：安全，3：假期，4：活动，5：奖惩，6：其他)
  notifyTypeName: string; // 通知类型名称
  signature: number; // 是否需要签名
  images: Array<string>; // 图片文件id
  imageUrls: Array<string>; // 图片文件url
  signatureFileId: string; // 签名文件id
  signatureFileUrl: string; // 签名文件url
  parentName: string; // 确认家长名称
  parentId: string; // 确认家长ID
  updateTime: number; // 更新时间
  studentId: string;
  studentName: string;
  publishTime: number; // 发布时间
  // 教师端
  notifyWay: number; // 通知方式(0按组织 1按学生)
  clazzList: Array<any>; // 班级ID
  studentList: Array<any>; // 学生ID
  syncType: string | undefined; // 0不同步 1班牌
  isTop: number; // 是否在班牌上置顶显示（0 不置顶  1置顶）
  topStartTime: number;
  topEndTime: number;
};

/**
 * 获取家校通知详情
 * @param studentId
 * @returns INoticeDetail
 */
export const getNoticeDetail = (studentId: string) =>
  request<INoticeDetail>(`/schoolNotices/${studentId}/actions/getStudentNoticeDetail`, {}, 'GET', {
    spaceType: request.service.campus,
    defaultError: false,
  });

export type IGuardianCourses = {
  date: string; // 日期 "2022-03-01"
  name: string; // 小孩名字
  morning: string; // 上午课程 "思想政治,艺术,美术,音乐"
  afternoon: string; // 下午课程 "体育,科学"
  evening: string; // 晚上课程
  courseMap: { [key: string]: string[] }; // 课程 1:[]; 2:[]; 3:[]
};

export interface ICurriculum {
  name: string;
  list: {
    type: string;
    lessons: string[];
  }[];
}
export type ICourse = { name: string; list: { type: string; lessons: string[] }[] }[];
/**
 * 家长端获得某天的孩子课表
 * @returns date 日期
 */
export const getGuardianCourses = (dateStr: string) =>
  request<IGuardianCourses[]>('/v1/cuser/parents/actions/parentCourses', { dateStr }, 'GET', {
    spaceType: request.service.campusbase,
    showLoading: false,
  });
