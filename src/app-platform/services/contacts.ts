/** 图片base */
import { request } from '@/utils/request';

export const SchoolRules = {
  EnterSchoolRule: '入校规则',
  LeaveSchoolRule: '出校规则',
};

export interface ITagDTOList {
  id: string;
  name: string;
  typeCode: 'EnterSchoolRule' | 'LeaveSchoolRule';
}
export interface IStudentAdd {
  name: string; // 学生姓名
  gender: number; // 性别：2、女；1、男
  studentCode: string; // 学籍号

  accommodation: number; // 住校信息：0、走读；1、住校；2、半走读; 3-全晚自习
  spaceId: string; //缺少宿舍号

  parentReqs: {
    name: string;
    relation: number;
    mobilePhone: string;
  }[];
  tagDTOList: ITagDTOList[];

  birthday: string; // 出生日期
  cardCode: string; // 学生卡号
  certificateNumber: string;
  certificateType: number; // 证件类型：0、身份证；1、军官证；2、护照；3、通行证
  clazzId: number; // 班级ID
  dietaryHabit: string;
  enrollmentYear: number;

  hobby: string;
  hometownAddr: string;
  id: number;
  isUpload: number;
  locationId: number;
  motto: string;

  nation: number;
  personalIdeal: string;
  spaceFilterCode: string;
  allergyTypeList: any[]; // 过敏信息
  allergyDetail: string | null; // 过敏详细
  status: number;

  userId: number;
}

type CertificateDetailParams = {
  personType: number; // 人员类型:0、教职工; 1、学生; 2、家长
  personId?: string | number; // 人员id
  locationId: string;
};

export type CertificateInfo = {
  cardCode?: string; // 卡号
  id?: string;
  locationId: string;
  faces?: any[]; // 人脸信息
  fingerprints?: any[]; // 指纹详情
  [name: string]: any;
} & CertificateDetailParams;

export interface IStudentDetailRtn {
  accommodation: number;
  allergyTypeList: any[];
  allergyDetail: string | null;
  birthday: number;
  cardCode: string;
  cardStatus: number;
  certificateNumber: string;
  certificateType: number;
  clazzId: string;
  clazzName: string;
  clazzOperator: boolean;
  dietaryHabit: string;
  gender: number;
  id: string;
  imageResps: any[];
  locationId: number;
  name: string;
  nation: number;
  school: string;
  sectionType: number;
  spaceId: string;
  spaceName: string;
  status: number;
  studentCode: string;
  faceStatus: 0 | 1;
  tagList: {
    typeCode: 'EnterSchoolRule' | 'LeaveSchoolRule';
    name: string;
    id: string;
  }[];
  tagDTOList: {
    typeCode: 'EnterSchoolRule' | 'LeaveSchoolRule';
    name: string;
    id: string;
  }[];

  studentParentResps: [
    {
      cardStatus: number;
      certificateNumber: string;
      certificateType: number;
      id: string;
      imageResps: any[];
      isContacts: number;
      mobilePhone: string;
      name: string;
      relation: number;
    },
  ];
}

export interface IGetVoucherRtn {
  id: string;
  cardCode: string;
  locationId: string;
  faces: {
    imgId: string;
    imgUrl: string;
    fileId: string;
  }[];
}

export interface IStudentDetailRtnWrap {
  baseInfoResp: IStudentDetailRtn;
  voucherResp: IGetVoucherRtn;
  showPrivacyPic: boolean;
}

/** 图片base */
export const fileStreamBase64 = (fileId: string) =>
  request<string>(`/v1/frontend/file-stream/base64/${fileId}`, {}, 'GET');

/** 学生详情 */
export const studentDetail = (id: string) =>
  request<IStudentDetailRtnWrap>(`/v1/students/h5/detail/${id}`, {}, 'GET', {
    spaceType: request.service.sas,
  });

/** 删除学生 */
export const studentDel = (ids: string[]) =>
  request<boolean>('/v1/students', ids, 'DELETE', {
    spaceType: request.service.campusbase,
    defaultError: true,
  });

/** 获取宿舍号 */
export interface IGetAccommodation {
  name: string;
  id: string;
}
export const getAccommodation = () =>
  request<IGetAccommodation[]>(`/space/accommodation`, {}, 'GET', {
    spaceType: request.service.space,
  });

export interface IGetTagTreeRtn {
  id: string;
  tagTypeCode: string;
  tagTypeName: string;
  tagVOList: {
    name: string;
    typeCode: string;
    id: string;
  }[];
}
export const getTagTree = () =>
  request<IGetTagTreeRtn[]>(`/student/tag/actions/getTree`, {}, 'GET', {
    spaceType: request.service.campusbase,
    contentType_json: true,
  });

interface IStudentAddForm {
  baseInfoReq: IStudentAdd;
  voucherReq: CertificateInfo;
}

/** 新增学生 */
export const studentAdd = (params: IStudentAddForm) =>
  request('/v1/students/h5/save', params, 'POST', {
    spaceType: request.service.sas,
  });

/** 学生更新 */
export const studentEdit = (id: string, params: IStudentAddForm) =>
  request(`/v1/students/h5/update/${id}`, params, 'POST', { spaceType: request.service.sas });

export interface IGetClazzInvite {
  id: number;
  inviteCode: string;
  needApprove: number;
  clazzId: string;
  clazzName: string;

  inviter: string;

  inviterName: string;
  locationId: string;
  locationName: string;
}
export interface ISubmitApplyToClazz {
  clazzId: string;
  inviteId: number;
  inviter: string;
  inviterName: string;
  locationId: string;
  applyParentVoList: {
    name?: string;
    relationType: number;
    code: string;
    encryptedData: string;
    iv: string;
    appId: string;
  }[];
  applyStudentVoList: {
    certificateNo?: string;
    certificateType?: number;
    gender: number;
    name: string;
    studentCode?: string;
  }[];
}

export const getClazzInvite = (inviteId: string) =>
  request<IGetClazzInvite>(
    '/anon/v1/frontend/teachers/actions/getClazzInvite',
    { inviteId },
    'GET',
    {
      spaceType: request.service.person,
    },
  );

/** 判断邀请信息是否有效 */
export const isValidateInvitation = (inviteId: string) =>
  request<boolean>('/anon/v1/frontend/teachers/actions/isValidateInvitation', { inviteId }, 'GET', {
    spaceType: request.service.person,
    defaultError: false,
  });

/** 家长提交申请入班 */
export const submitApplyToClazz = (data: ISubmitApplyToClazz) =>
  request('/anon/v1/frontend/parents/actions/submitClazzApply', data, 'PUT', {
    spaceType: 'c/' + request.service.campusbase,
    defaultError: true,
  });

interface IListApproveToClazz {
  teacherId: string;
  status: number;
  pageSize: number;
  pageNum: number;
}

export interface IListApproveToClazzRtn {
  id: number;
  createTime: number;
  parentInfo: string;
  applyStudentVo: {
    certificateNo: string;
    certificateType: number;
    gender: number;
    name: string;
    studentCode: string;
  };
  applyParentVoList: {
    name: string;
    relationType: number;
  }[];
  applyStudentVoList: {
    certificateNo?: string;
    certificateType?: number;
    gender: number;
    name: string;
    studentCode?: string;
  }[];
  inviter: string;
  inviterName: string;
  clazzName: string;

  clazzId: string;
  approver: string;
  approverName: string;
  approveResult: number;
  approveDate: number;
}

export type IRequestList<T> = {
  total: number;
  pageSize: number;
  pageNumber: number;
  result: T;
};

/** 查询入班申请列表 */
export const listApproveToClazz = (data: IListApproveToClazz) =>
  request<IRequestList<IListApproveToClazzRtn[]>>(
    '/v1/frontend/teachers/actions/listClazzApply',
    data,
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

interface IApproveRecord {
  status: number;
  approver: string;
  applyIdList: number[];
}
/** 审核 */
export const approveRecord = (data: IApproveRecord) =>
  request('/v1/frontend/teachers/actions/approveRecord', data, 'POST', {
    spaceType: request.service.campusbase,
    defaultError: false,
  });

/** 重置密码 */
export const reSetPassword = (data: {
  personId: string | number;
  studentCode?: string | number;
  certificateNumber?: string | number;
}) =>
  request('/v1/cuser/actions/reSetPassword', data, 'PUT', {
    spaceType: request.service.auth,
    defaultError: false,
  });
