import { request } from '@/utils/request';
import useIsTeacher from '@/utils/use-is-teacher';
import {
  CategoryItem,
  DetailOfStudent,
  DetailOfTrack,
  RecordItem,
  SicknessLabelItem,
  SymptomItem,
  SymptomItemInCategoryItem,
} from '../disease-management/types/record';

/**
 * 分页获取学生患病记录
 * @param params
 * @returns
 */

export interface IFetchStudentDiseaseRecordsParam {
  sickenStartDate: string;
  sickenEndDate: string;
  pageSize: number;
  pageNum: number;
  studentIds: string[] | number[];
  status?: number;
}

export const fetchStudentDiseaseRecords = (params: IFetchStudentDiseaseRecordsParam) => {
  return request<{
    result: RecordItem[];
  }>('/cus/sicknessRecords/actions/queryPage', params, 'POST', {
    spaceType: request.service.sickness,
  });
};

export const fetchStudentDiseaseDetail = (id: string) => {
  return request<DetailOfStudent>(`/cus/sicknessRecords/actions/detail/${id}`, {}, 'GET', {
    spaceType: request.service.sickness,
  });
};

export const fetchStudentDiseaseTracking = (id: string) => {
  return request<DetailOfTrack[]>(
    `/cus/sicknessTraceRecords/actions/getTraceRecordList/${id}`,
    {},
    'GET',
    {
      spaceType: request.service.sickness,
    },
  );
};

export const fetchStudentOperationTracking = (id: string) => {
  return request<DetailOfTrack[]>(
    `/cus/sicknessOperationRecords/actions/getOperationRecordList/${id}`,
    {},
    'GET',
    {
      spaceType: request.service.sickness,
    },
  );
};

export interface ISicknessCategorysResult {
  id: number;
  name: string;
  symptomList: SymptomItem[];
}

export const fetchSicknessCategorys = (params: { name?: string }) => {
  return request<CategoryItem[]>(
    useIsTeacher()
      ? `/sicknessCategorys/actions/selectList`
      : `/cus/sicknessCategorys/actions/selectList`,
    params,
    'GET',
    {
      spaceType: request.service.sickness,
    },
  );
};

export const fetchSicknessLabels = (params: { symptomIds: string[] }) => {
  return request<SicknessLabelItem[]>(`/sicknessLabels/actions/selectList`, params, 'POST', {
    spaceType: request.service.sickness,
  });
};

export interface SicknessTraceRecordFile {
  type: number; //附件类型 1复园诊断书 2、病例报告
  fileUrl: string;
  fileId: string;
}
export interface SaveSicknessTraceRecordParam {
  id?: string;
  recordId: string;
  customFlag: number; //0系统 1自定义（疾病标签使用)
  fileList: SicknessTraceRecordFile[]; //报告图片集合
  healthDate?: string; //复园日期
  healthFlag: number; //是否健康 0否 1是
  hospital: string;
  outpatientFlag: number; //是否就诊 0否 1是
  sicknessLabelName: string; //疾病标签名称
  symptomList: SymptomItemInCategoryItem[];
  userSource: number; //用户来源 1家长 2老师
}

export const saveSicknessTraceRecords = (params: SaveSicknessTraceRecordParam) => {
  return request<SicknessLabelItem[]>(
    useIsTeacher()
      ? '/sicknessTraceRecords/actions/save'
      : `/cus/sicknessTraceRecords/actions/save`,
    params,
    'POST',
    {
      spaceType: request.service.sickness,
    },
  );
};

export const deleteStudentDiseaseTracking = (id: string) => {
  return request(`/cus/sicknessTraceRecords/actions/delete/${id}`, {}, 'DELETE', {
    spaceType: request.service.sickness,
  });
};

export const fetchStudentDiseaseTrackingDetail = (id: string) => {
  return request<DetailOfTrack>(
    `/cus/sicknessTraceRecords/actions/getTraceRecordDetail/${id}`,
    {},
    'GET',
    {
      spaceType: request.service.sickness,
    },
  );
};

export const updateSicknessTraceRecords = (params: SaveSicknessTraceRecordParam) => {
  return request<DetailOfTrack>(`/cus/sicknessTraceRecords/actions/update`, params, 'PUT', {
    spaceType: request.service.sickness,
  });
};

export const checkSicknessLabelName = (params: { name: string }) => {
  return request<DetailOfTrack>(`/cus/sicknessLabels/actions/checkName`, params, 'GET', {
    spaceType: request.service.sickness,
  });
};
