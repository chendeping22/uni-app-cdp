import { request } from '@/utils/request';

export interface IAccessAlarmDetail {
  accessName: string; //出入口名称
  certificateNumber: string; //证件号
  personName: string; //人员名称
  spaceName: string; //告警区域
  name: string; //告警任务名称
  levelCode: number; //告警等级Code
  snapTime: string; //抓拍时间
  status: number; //处理状态：0未处理 1已处理
  handleContent: string; // 处理方式
  handleDescription: string; // 处理内容
  handleByName: string; //处理人员
  handleTime: string; //处理时间
  healthCode: number; //健康码信息 0绿 1 黄 2红
  temperature: number; //体温
  accessType: number; // 出入口类型
  snapImageUrl: string; // 抓拍图
  [key: string]: any;
}

export interface IAccessItemDetail {
  personName: string; //人员名称
  accessName: string; //出入口名称
  accessType: number; // 出入口类型
  clazzName: string; // 班级名称
  snapImageUrl: string; // 抓拍图
  throughStatus: number; // 通行状态
  failedReason: string; // 失败原因
  createTime: number; // 创建时间
}

export interface IHandleAccessAlarm {
  ids: string[];
  handleCode?: string;
  handleContent?: string;
  updateBy?: number;
  handleDescription?: string;
}

/**
 * 获取出入告警详情
 * @param id
 * @returns
 */
export const getAccessRecordsAlarmDetail = (id: string) =>
  request<IAccessAlarmDetail>(`/v1/frontend/access/alarm/record/${id}`, {}, 'GET', {
    spaceType: request.service.passage,
  });

/**
 * 告警处理
 * @param id
 * @returns
 */
export const handleAccessRecordsAlarm = (data: IHandleAccessAlarm) =>
  request(`/v1/frontend/access/alarm/record/actions/handle`, data, 'PUT', {
    spaceType: request.service.passage,
  });

/**
 * 出校入校通知详情
 * @param id
 * @returns
 */
export const getAccessInOutNotificationDetail = (id: string) =>
  request(`/v1/frontend/accessRecords/notification/${id}`, {}, 'GET', {
    spaceType: request.service.passage,
  });
