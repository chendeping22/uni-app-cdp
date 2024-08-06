import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { request } from '@/utils/request';

//记录状态 1待确认 2待服药 3已服药 4已拒绝 5已撤回 6已失效 7:其他
export type statusType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

//接口请求type
export type getListType = {
  pageNum: number;
  pageSize: number;
  status?: number | null;
  studentName?: string;
  studentIds?: Array<string | number> | null; //学生id列表
};
//列表查询数据

/**
 * StudentCountVO对象，学生人数统计
 */
export interface responseListType {
  page?: PageRegister;
  /**
   * 待确认人数
   */
  unConfirmedNum?: number;
  /**
   * 待服药人数
   */
  unTakeMedicineNum?: number;
}

/**
 * Page«Register对象»
 */
export interface PageRegister {
  endRow?: number;
  firstPage?: boolean;
  hasNextPage?: boolean;
  hasPrePage?: boolean;
  lastPage?: boolean;
  nextPage?: number;
  offset?: number;
  pageNum?: number;
  pages?: number;
  pageSize?: number;
  prePage?: number;
  result?: rowInfoType[];
  startRow?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Register对象，服药登记表
 */
export interface rowInfoType {
  /**
   * 班级ID
   */
  clazzId?: number;
  /**
   * 班级名称
   */
  clazzName?: string;
  /**
   * 备注
   */
  comment?: string;
  createBy?: number;
  createByName?: string;
  createTime?: Date;
  /**
   * 0正常 1删除
   */
  deleted?: number;
  /**
   * 性别
   */
  gender?: number;
  /**
   * 年级ID
   */
  gradeId?: number;
  id?: number;
  locationId?: number;
  /**
   * 服药日期
   */
  medicationDate?: Date;
  /**
   * 服药药品
   */
  medicationItems?: medicationItemsType[];
  /**
   * 人脸照片
   */
  photoUrl?: string;
  /**
   * 拒绝原因
   */
  refuseReason?: string;
  /**
   * 记录状态 1待确认 2待服药 3已服药 4已拒绝 5已撤回 6已失效
   */
  status?: number;
  /**
   * 记录状态名称
   */
  statusName?: string;
  /**
   * 学生ID
   */
  studentId?: number;
  /**
   * 学生姓名
   */
  studentName?: string;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * medicationItemsType，服药药品
 */
export interface medicationItemsType {
  createBy?: number;
  createTime?: Date;
  /**
   * 0正常 1删除
   */
  deleted?: number;
  id?: number;
  /**
   * 服药说明
   */
  introductions?: string;
  locationId?: number;
  /**
   * 药品名称
   */
  name?: string;
  /**
   * 服药登记表ID
   */
  registerId?: number;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * 服药记录新增
 */
export interface RequestAddRecordsType {
  /**
   * 服药反馈
   */
  feedback?: string;
  /**
   * 服药药品图片文件
   */
  medicationFileList?: addActionItemType[];
  /**
   * 服药时间
   */
  medicationTime?: number;
  /**
   * 服药登记表ID
   */
  registerId?: number;
}

/**
 * 新增服药记录信息
 */
export interface addActionItemType {
  /**
   * 图片原文件ID
   */
  fileId?: string;
  id?: number;
  /**
   * 缩略图片文件ID，不用传
   */
  thumbnailFileId?: string;
  /**
   * 上传类型 1服药药品图 2家长签名图 3服药记录图
   */
  uploadType?: number;
}
export interface responsePageDetailType {
  /**
   * 班级ID
   */
  clazzId?: number;
  /**
   * 班级名称
   */
  clazzName?: string;
  /**
   * 备注
   */
  comment?: string;
  /**
   * 创建人名称
   */
  createByName?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 性别
   */
  gender?: number;
  /**
   * 年级ID
   */
  gradeId?: number;
  id?: number;
  /**
   * 服药日期
   */
  medicationDate?: number | null;
  /**
   * 服药图片文件
   */
  medicationFiles?: filesType[];
  /**
   * 服药药品
   */
  medicationItems?: medicationItemsType[];
  /**
   * 服药日志
   */
  medicationLogs?: logType[];
  /**
   * 服药记录
   */
  medicationRecords?: recordType[];
  /**
   * 人脸照片
   */
  photoUrl?: string;
  /**
   * 拒绝原因
   */
  refuseReason?: string;
  /**
   * 记录状态 1待确认 2待服药 3已服药 4已拒绝 5已撤回 6已失效
   */
  status?: number;
  statusName?: string;
  /**
   * 学生ID
   */
  studentId?: number;
  /**
   * 学生姓名
   */
  studentName?: string;
}

/**
 * File对象，服药图片
 */
export interface filesType {
  /**
   * 图片原文件ID
   */
  fileId?: string;
  /**
   * 图片原文URL
   */
  fileURL?: string;
  id?: number;
  /**
   * 服药记录表ID
   */
  recordId?: number;
  /**
   * 服药登记表ID
   */
  registerId?: number;
  /**
   * 缩略图片文件ID
   */
  thumbnailFileId?: string;
  /**
   * 上传类型 1服药药品图 2家长签名图 3服药记录图
   */
  uploadType?: number;
}

/**
 * Log对象，服药登记表日志
 */
export interface logType {
  createBy?: number;
  /**
   * 用户名称
   */
  createByName?: string;
  createTime?: Date;
  /**
   * 0正常 1删除
   */
  deleted?: number;
  id?: number;
  locationId?: number;
  /**
   * 服药登记表ID
   */
  registerId?: number;
  /**
   * 操作状态 1登记 2确认 3提交服药 4修改 5拒绝 6撤回
   */
  status?: number;
  statusName?: string;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * Record对象，服药记录表
 */
export interface recordType {
  createBy?: number;
  createTime?: Date;
  /**
   * 0正常 1删除
   */
  deleted?: number;
  /**
   * 服药反馈
   */
  feedback?: string;
  id?: number;
  locationId?: number;
  /**
   * 服药时间
   */
  medicationTime?: Date;
  /**
   * 服药登记表ID
   */
  registerId?: number;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * 获取列表
 * @param params
 * @returns
 */
export const fetchList = (params: getListType) => {
  return request<{
    result: rowInfoType[];
  }>(
    loginStore().currentUserType == EUserType.teacher
      ? '/medicationRegisters/actions/queryCountPage'
      : '/cus/medicationRegisters/actions/queryPage',
    params,
    'POST',
    {
      showLoading: false,
      spaceType: request.service.medication,
    },
  );
};

/**
 * 确认服药登记
 * @param params
 * @returns
 */
export const addRecords = (params: RequestAddRecordsType) => {
  return request<RequestAddRecordsType>('/medicationRecords/actions/save', params, 'POST', {
    showLoading: true,
    spaceType: request.service.medication,
  });
};
/**
 * 家长端服药记录新增
 * @param params
 * @returns
 */
export interface AddMedicineRecordsType {
  /**
   * 备注
   */
  comment?: string;
  /**
   * 创建人名称可以不传
   */
  createByName?: string;
  id?: number | string;
  locationId?: number;
  /**
   * 服药日期
   */
  medicationDate: number | null;
  /**
   * 服药药品图片文件
   */
  medicationFileList: filesType[];
  /**
   * 服药药品
   */
  medicationItemList?: medicationItemsType[];
  /**
   * 学生ID，保存时，关于学生的信息，可以不传，但是必须传学生ID
   */
  studentId?: number;
  studentName?: string;
}

export const addMedicineRecords = (params: AddMedicineRecordsType) => {
  console.log(111);
  return request('/cus/medicationRegisters/actions/save', params, 'POST', {
    showLoading: true,
    spaceType: request.service.medication,
  });
};

/**
 * 学生信息
 */
export type TStudentInfo = {
  id: string;
  gender?: number; // 性别：2、女；1、男
  name: string; // 学生姓名
  clazzName?: string; // 班级名称
  firstLetter?: string; // 名称首字母
};
/**
 * 获取关联的小孩列表
 * @returns
 */
export const fetchChildren = () => {
  return request<TStudentInfo[]>('/v1/cuser/parents/actions/students', null, 'GET', {
    showLoading: true,
    spaceType: request.service.campusbase,
  });
};

/**
 * 家长端服药记录修改
 * @param params
 * @returns
 */
export const updateMedicineRecords = (params: AddMedicineRecordsType) => {
  return request('/cus/medicationRegisters/actions/update', params, 'PUT', {
    showLoading: true,
    spaceType: request.service.medication,
    defaultError: false,
  });
};
// 获取服药登记详情
export const getPageDetailApi = (id: string | number) => {
  return request<responsePageDetailType>(
    loginStore().currentUserType == EUserType.teacher
      ? `/medicationRegisters/${id}/actions/getDetail`
      : `/cus/medicationRegisters/${id}/actions/getDetail`,
    {},
    'GET',
    {
      showLoading: true,
      spaceType: request.service.medication,
    },
  );
};
// 导入上次服药登记
export const getLastPageDetailApi = (id: string | number) => {
  return request<responsePageDetailType>(
    `/cus/medicationRegisters/${id}/actions/getStudentDetail`,
    {},
    'GET',
    {
      showLoading: true,
      spaceType: request.service.medication,
    },
  );
};
// 撤回服药登记
export const rollbackPageDetailApi = (id: string | number) => {
  return request(`/cus/medicationRegisters/${id}/actions/rollback`, {}, 'PUT', {
    showLoading: true,
    spaceType: request.service.medication,
    defaultError: false,
  });
};

// 服药登记同意
export const agreeAction = (id: number) => {
  return request(`/medicationRegisters/${id}/actions/agree`, {}, 'PUT', {
    showLoading: true,
    spaceType: request.service.medication,
    defaultError: false,
  });
};

// 服药登记拒绝
export const rejectAction = (id: number, data: { refuseReason: string | undefined }) => {
  return request(`/medicationRegisters/${id}/actions/reject`, data, 'PUT', {
    showLoading: true,
    spaceType: request.service.medication,
    defaultError: false,
  });
};
