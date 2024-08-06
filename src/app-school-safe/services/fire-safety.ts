import { request } from '@/utils/request';

export interface FireSafetyAlarmItem {
  id: string;
  deviceModel: string;
  levelCode: string; // 告警等级编码
  configId: string;
  configName: string; // 告警任务名称
  spaceName: string; // 空间名称
  createTime: number;
  handleStatus: number; // 处理状态
  handleBy: string; // 处理人id
  handleByName: string; // 处理人
  handleResult: number; // 处理方式
  handleResultName: string; // 处理结果
  handleDescription: string; // 处理内容
  handleTime: number; // 处理时间
  videoUrl?: string; // 告警视频
  extMap?: {
    command: string; // 更多处理方式
  };
  [key: string]: any;
}

/**设备告警详情 */
export const getAlarmDetail = (id: string) =>
  request<FireSafetyAlarmItem>(`/v2/alarmRecord/device/${id}`, {}, 'GET', {
    spaceType: request.service.alarm,
  });

/**批量处理告警 */
export const handleAlarm = (data: {
  recordIds?: (string | number)[];
  handleResult: number;
  handleDescription: string;
  control?: { commands: string[] } | undefined;
}) =>
  request(`/v2/alarmRecord/actions/batchHandles`, data, 'PUT', {
    spaceType: request.service.alarm,
  });
