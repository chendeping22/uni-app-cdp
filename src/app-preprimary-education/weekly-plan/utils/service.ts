import { request } from '@/utils/request';
export interface IWeeklyPlanInfoItem {
  id: string; //计划ID
  clazzId: string; //班级ID
  clazzName: string; //班级名称
  year: number; //年份
  week: number; //周
  startDate: number; //开始时间
  endDate: number; //结束时间
  templateId: string; //模版ID
  templateName: string; //模版名称
  planWeeklyDetailDtos?: //周计划明细
  {
    id: string; //明细ID
    planWeeklyId: string; //计划ID
    itemId: string; //配置项ID
    itemName: string; //配置项名称
    content: string; //配置项内容
  }[];
  creator: string;
  createBy: string;
  updateTime: number;
  publishFormat: number;
  fileId?: string;
  fileUrl?: string;
  yearConfig?: any;
}

export const getPlanWeeklyInfo = (params: { clazzId: string; year: number; week: number }) =>
  request<IWeeklyPlanInfoItem>(`/v2/planWeeklys/actions/findByClazzAndWeek`, params, 'GET', {
    spaceType: request.service.quality,
  });
/** 获取所有周计划模版数据 */
export const findAllTemplate = () =>
  request(`/planWeeklyTemplates/actions/findAllTemplate`, {}, 'GET', {
    spaceType: request.service.quality,
  });

/** 获取周计划模版详情 */
export const findTemplateConfig = (id: string) =>
  request(`/planWeeklyTemplates/actions/getById/${id}`, {}, 'GET', {
    spaceType: request.service.quality,
  });

/** 保存周计划 */
export const savePlanWeekly = (params: any) =>
  request(`/v2/planWeeklys/actions/savePlanWeekly`, params, 'POST', {
    spaceType: request.service.quality,
  });

/** 更新周计划 */
export const updatePlanWeekly = (params: any) =>
  request(`/v2/planWeeklys/actions/updatePlanWeekly`, params, 'PUT', {
    spaceType: request.service.quality,
  });

/** 删除周计划 */
export const deletePlanWeekly = (planWeeklyId: string) =>
  request(
    `/v2/planWeeklys/actions/deletePlanWeeklyInfo?planWeeklyId=${planWeeklyId}`,
    {},
    'DELETE',
    {
      spaceType: request.service.quality,
    },
  );
