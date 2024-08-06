import { request } from '@/utils/request';

export interface IIpcNodeType {
  id: string;
  name: string;
  type: string;
  ipcCount: number;
  alarmCount: number;
  deviceCount: number;
  children?: IIpcNodeType[];
  status?: number;
  uuid: string;
  spaceName?: string;
}

/**
 * 抓怕记录查询条件类型
 */
export interface ICaptureRecordQueryParam {
  deviceId: string; // ipc设备uuid
  startTime: string; // 查询开始时间
  endTime: string; // 查询结束时间
  offset?: number; // 下一个请求的偏移量
  pageSize?: number; // 每页条数
}

/**
 * 抓拍记录
 */
export interface ICaptureRecord {
  id: string; // 抓拍记录id
  captureImgUrl: string; // 抓拍图片
  captureTime: number; // 抓拍时间
  libraryType: number; // 库类型
  personType: number; // 人员类型
  personName?: string; // 人员姓名
}

/**
 * 抓拍记录详情
 */
export interface ICaptureRecordInfo {
  id: string; // 抓拍记录id
  captureImgUrl: string; // 抓拍图片
  captureTime: number; // 抓拍时间
  similarity: number; // 相似度
  faceArchiveDetailResp: {
    labelNames?: string[]; // 标签名称
    personName?: string; // 人员名称
    personType?: number; // 人员类型
    coverUrl?: string; // 地库图
  };
  faceInfoDTO: {
    properties: string[]; // 抓拍到的特征值
  };
  faceId: string;
  [key: string]: any;
}

/**
 * 音柱
 */
export interface ISpeaker {
  deviceModel: string;
  deviceName: string;
  deviceId: string;
  hasCamera: boolean;
}

/**
 * 音柱相关协议
 */
export interface ISpeakerInfo {
  signalUrl: string;
  taskCode?: string;
  serverIpList: string[];
  protocol: number;
  port: number;
  deviceId: string;
  deviceModel: string;
  onlineStatus: string;
}

/**
 * 获取ipc树
 */
export const fetchIpcList = () => {
  return request<IIpcNodeType[]>(
    '/v1/overviews/actions/space/device/tree?deviceType=IPC,BAIPC,SFIPC',
    {},
    'GET',
    {
      spaceType: request.service.sas,
      timeout: 30000,
    },
  );
};

/**
 * 获取音柱列表
 */
export const fetchSpeakerList = (deviceId: string) => {
  return request<ISpeaker[]>(`/${deviceId}/getSpeakersByDeviceId`, {}, 'GET', {
    spaceType: request.service.sas,
  });
};

/**
 * 获取音柱协议信息
 */
export const fetchSpeakerInfo = (deviceIds: string[]) => {
  return request<ISpeakerInfo>(`/actions/callSpeaker`, deviceIds, 'POST', {
    spaceType: request.service.sas,
    timeout: 30000,
  });
};

/**
 * 获取音柱协议信息
 */
export const stopSpeaker = (deviceIds: string[]) => {
  return request<ISpeakerInfo>(`/actions/stopCallSpeaker`, deviceIds, 'POST', {
    spaceType: request.service.sas,
    timeout: 30000,
  });
};

/**
 * 设置声音
 */
export const setVol = (deviceId: string, volume: number) => {
  return request<ISpeakerInfo>(
    `/radioDevice/actions/setVolume?uuid=${deviceId}&percentVolume=${volume}`,
    {},
    'PUT',
    {
      spaceType: request.service.building,
      timeout: 30000,
    },
  );
};

/**
 * 获取抓拍记录
 * @param params
 * @returns
 */
export const fetchCaptureRecords = (params: ICaptureRecordQueryParam) => {
  return request<{
    faceSearchResps: ICaptureRecord[];
    offset: number;
  }>('/v1/face/search', params, 'POST', {
    showLoading: true,
    spaceType: request.service.sas,
  });
};

/**
 * 获取抓拍详情记录
 * @param recordId
 * @returns
 */
export const fetchCaptureRecordDetail = (recordId: string) => {
  return request<ICaptureRecordInfo>(`/v1/face/search/${recordId}`, {}, 'GET', {
    showLoading: true,
    spaceType: request.service.sas,
  });
};
