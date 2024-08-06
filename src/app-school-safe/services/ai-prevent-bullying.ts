import { request } from '@/utils/request';

export interface IIpcInfo {
  deviceId: string; // IPC-UUID
  deviceName: string; // ipc名称
  finishCapture: number; // 截取小视频状态
  snapImgUrl?: string; // 抓拍图Url
  videoId?: string; // 截取小视频id
  videoUrl?: string; // 截取小视频url
  onlineStatus?: string; // 设备在线状态 connected-在线 disconnected-离线
  spaceFullName?: string; // 空间完整路径
}

export interface IAlarmDataItem {
  id: string;
  deviceId: string; // 防欺凌设备ID
  spaceName: string; // 空间名称
  conditionJson?: string; // 告警条件
  monitorType: number; // 告警类型 6，关键字（防欺凌）7，声强 8，烟感 9，红外感应 10,设备端一键告警
  levelCode: string; // 告警等级
  levelName: string; // 告警等级名称
  snapTime: number; // 告警时间
  audioUrl?: string; // 音频url
  recordTime?: number; // 音频时长
  recordExtVOList?: IIpcInfo[]; // 防欺凌告警关联IPC的扩展信息
  [key: string]: any;
}

export interface IAudioDataItem {
  id: string;
  audioUrl?: string; // 音频url
  audioDuration?: number; //  录音时长(秒)
  monitorType: number; // 告警类型 6，关键字（防欺凌）7，声强 8，烟感 9，红外感应 10,设备端一键告警
  snapTime: number; // 录音时间
  [key: string]: any;
}

export interface IBullyingNodeType {
  id: string;
  name: string;
  deviceType: string;
  children?: IBullyingNodeType[];
  status?: number;
}

export interface IBullyingServerInfo {
  areaIp: string; // 服务器ip
  areaPort: number; // 服务器端口
}

export interface IBullyingAccountInfo {
  userName: string; // 用户名
  password: string; // 密码
}

// 获取事件列表
export const fetchRecordList = (params: {
  pageSize: number;
  pageNum: number;
  monitorType?: number;
  alarmTimeStart?: number;
  alarmTimeEnd?: number;
}) => {
  return request<{
    total: number;
    result: IAlarmDataItem[];
  }>(`/antiBullying/record/actions/page`, params, 'POST', {
    spaceType: request.service.sas,
  });
};

// 获取告警详情
export const fetchRecordDetail = (recordId: string) => {
  return request<IAlarmDataItem>(
    `/antiBullying/record/${recordId}/actions/getDetail`,
    null,
    'GET',
    {
      spaceType: request.service.sas,
    },
  );
};

// 获取音频列表
export const fetchAudioList = (params: {
  pageSize: number;
  pageNum: number;
  deviceId: string; // 防欺凌设备id
  startTime: number; // 开始时间
  endTime: number; // 结束时间
}) => {
  return request<{
    total: number;
    result: IAudioDataItem[];
  }>(`/antiBullying/deviceConfig/action/getAudioList`, params, 'GET', {
    spaceType: request.service.sas,
  });
};

// 获取设备空间树
export const fetchBullyingList = () => {
  return request<IBullyingNodeType[]>(
    '/device/trees/actions/antiBully',
    { deviceTypes: ['SpeechAlarm'] },
    'POST',
    {
      spaceType: request.service.sas,
    },
  );
};

// 根据设备id获取关联的ipc信息
export const fetchRelIpcInfo = (deviceId: string) => {
  return request<IIpcInfo>('/antiBullying/deviceConfig/getRelIpc', { deviceId }, 'GET', {
    spaceType: request.service.sas,
  });
};

// 获取对讲平台信息
export const fetchBullyingServerInfo = () => {
  return request<IBullyingServerInfo>(
    '/antiBullying/deviceConfig/action/getAreaServerInfo',
    null,
    'GET',
    {
      spaceType: request.service.sas,
    },
  );
};

// 获取对讲账号信息
export const fetchBullyingAccountInfo = (extId: string) => {
  return request<IBullyingAccountInfo>(
    '/antiBullying/deviceConfig/action/getAccountInfo',
    {
      extId,
      termType: 1, // 终端类型（1：app，2：班牌）
    },
    'GET',
    {
      spaceType: request.service.sas,
    },
  );
};

// 获取被叫端的extId信息
export const fetchBullyingExtId = (deviceId: string) => {
  return request<string>('/antiBullying/deviceConfig/action/getExtId', { deviceId }, 'GET', {
    spaceType: request.service.sas,
  });
};
