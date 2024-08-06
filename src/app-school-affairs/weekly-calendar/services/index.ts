import { request } from '@/utils/request';
import type {
  ActionsConfigRspData,
  ConditionReqData,
  ConditionRspData,
  WeeklyCalendarsReq,
} from '../constants/index';

/**
 * 获取校历接口
 * @returns
 */
export const fetchFindSchoolCalendar = (locationId?: string) => {
  const url = `/actions/findSchoolCalendar${locationId ? '/' + locationId : ''}`;
  return request(url, {}, 'GET', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};
/**
 * 查询周行事历
 * @returns
 */
export const fetchFindByConditions = (params: ConditionReqData) => {
  return request<ConditionRspData[]>('/actions/findByConditions', params, 'POST', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};

/**
 * 获取周行事历配置
 * @returns
 */
export const fetchActionsConfig = () => {
  return request<ActionsConfigRspData>('/actions/getConfigs', {}, 'GET', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};
/**
 * 添加周行事历
 * @returns
 */
export const fetchAddWeeklyCalendars = (params: WeeklyCalendarsReq) => {
  return request('/', params, 'POST', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};

/**
 * 编辑周行事历
 * @returns
 */
export const fetchEditWeeklyCalendars = (params: WeeklyCalendarsReq) => {
  return request(`/${params.id}`, params, 'PUT', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};

// //获取人员数据
// export const fetchTreeData = async (data: any) => {
//   return Http.getInstance().post('/api/auth/userSelect/getUserByDeptIds', data);
// };

/**
 * 删除周行事历
 * @returns
 */
export const deleteEvent = (id: string) => {
  return request(`/${id}`, {}, 'DELETE', {
    showLoading: true,
    spaceType: request.service.weeklyCalendars,
  });
};

// 获取人员数据
export const fetchTreeData = async (params: any) => {
  return request<any>('/userSelect/getUserByDeptIds', params, 'POST', {
    showLoading: true,
    spaceType: request.service.auth,
  });
};
// 获取日志
export const operationLog = async (params: any) => {
  return request('/operateLogV2/actions/list', params, 'POST', {
    showLoading: true,
    spaceType: request.service.data,
  });
};
