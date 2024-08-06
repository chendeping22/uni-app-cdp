import { request } from '@/utils/request';

export interface IClazzVo {
  clazzName: string;
  nickName?: string;
  headTeacherIdList: string[];
  id: string;
  studentCount: number;
}
export interface IGradeVo {
  clazzVoList: IClazzVo[];
  gradeName: string;
  id: string;
}
export interface IGetClazzWithSectionByTeacherIdRtn {
  gradeVoList: IGradeVo[];
  id: number;
  sectionName: string;
}

/** 获取老师对应的班级信息（包含年级、学段信息） */
export const getClazzWithSectionByTeacherId = (teacherId: string) =>
  request<IGetClazzWithSectionByTeacherIdRtn[]>(
    `/v1/frontend/clazzes/actions/getClazzWithSectionByTeacherId`,
    { teacherId },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

export enum SchoolRosterTreeNodeLevel {
  /** 学校 */
  Project = 1,
  /** 学段 */
  Section = 2,
  /** 年级 */
  Grade = 3,
  /** 班级 */
  Clazz = 4,
  /** 学院 */
  Academy = 21,
  /** 专业 */
  Major = 22,
}

/**
 * 学段类型
 *
 * - 0: 幼儿园
 * - 1: 小学
 * - 2: 初中
 * - 3: 高中
 * - 4: 大学
 * - 98: 社团
 * - 99: 兴趣班
 */
export enum SectionType {
  /**
   * 幼儿园
   */
  Kindergarten = 0,
  /**
   * 小学
   */
  PrimarySchool = 1,
  /**
   * 初中
   */
  MiddleSchool = 2,
  /**
   * 高中
   */
  HighSchool = 3,
  /**
   * 大学
   */
  University = 4,
  /** 中高职 */
  VocationalEducation = 5,
  /**
   * 社团
   */
  Club = 98,
  /**
   * 兴趣班
   */
  InterestOrientedClass = 99,
}

export interface SchoolRosterTreeNode {
  childNodeList: SchoolRosterTreeNode[];

  /**
   * 节点编码：当level为2时，表示为年级类型（aka SchoolGradeType）
   *
   * - 0: 幼儿园
   * - 1: 小学
   * - 2: 初中
   * - 3: 高中
   * - 4: 大学
   * - 5: 中高职
   * - 98: 社团
   * - 99: 兴趣班
   */
  nodeCode: number | null;

  /**
   * 当nodeLevel === SchoolRosterTreeNodeLevel.Project，nodeId就是locationId
   */
  nodeId: string;

  /**
   * 节点等级
   *
   * - 1: 学校
   * - 2: 学段
   * - 3: 年级
   * - 4: 班级
   */
  nodeLevel: SchoolRosterTreeNodeLevel;

  /**
   * 节点名称
   */
  nodeName: string | null;

  /**
   * 父节点基本信息，无子节点信息
   */
  parentNodeBase: SchoolRosterTreeNode | null;

  /**
   * 是否是标准学段
   *
   * - 1: 是
   * - 0: 否
   *
   * @remarks
   *
   * IMP-85335这个需求之后，是否是标准学段就已经没有意义，因为所有的学段都是标准的
   */
  stdFlag: number;
}

export function iterate(
  nodes: SchoolRosterTreeNode[] = [],
  func: (n: SchoolRosterTreeNode) => boolean | void,
) {
  nodes.forEach(n => {
    const ret = func(n);
    if (ret === false) {
      return;
    }
    iterate(n.childNodeList, func);
  });
}

/**
 * （中高职/高校）获取老师对应的班级信息（包含年级、学段信息）
 * @param teacherId
 * @param skipRole 排除角色范围,多个时逗号隔开，目前支持排除的有: 'TakeCourseTeacher'
 * @returns
 */
export const getClazzWithSectionByTeacherId2 = async (teacherId: string, skipRole?: string) => {
  const data = await request<SchoolRosterTreeNode[]>(
    `/v1/frontend/clazzes/actions/getClazzWithSectionByTeacherId2`,
    {
      teacherId,
      skipRole: skipRole || '',
    },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

  return data;
};

export interface IGetPositionInfoByUserIdRtn {
  code: number; // 1-> 学校管理员; 2->学段负责人; 6->任课老师; 7->年级主任; 8->班主任; 9->超管; 10->部门负责人
  name: string;
  relIdList: string[];
}
/** 用户职位 */
export const getPositionInfoByUserId = () =>
  request<IGetPositionInfoByUserIdRtn[]>(
    `/v2/teachers/actions/getPositionInfoByUserId`,
    {},
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

/** 获取老师对应的班级信息（包含年级、学段信息） */
export const getClazzWithSectionByLocationId = () =>
  request<IGetClazzWithSectionByTeacherIdRtn[]>(
    `/v1/frontend/clazzes/actions/getClazzWithSectionByLocationId`,
    {},
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

export interface IStudentVo {
  clazzName: string;
  clazzId: string;
  id: string;
  name: string;
  gender: number;
  photoUrl: string;
  urgencyParent: string;
  urgencyParentType: number;
  urgencyParentMobilePhone: string;
  // 手机号?
}

export interface IGetStudentGroupByClazzRtn {
  clazzId: number;
  clazzName: string;
  guardianCount: number | null;
  studentCount: number | null;
  studentReList: IStudentVo[];
  teacherCount: number | null;
}

/** 通过班级进行分组学生查询  */
export const getStudentGroupByClazz = (studentName: string) =>
  request<IGetStudentGroupByClazzRtn[]>(
    `/v1/frontend/clazzes/actions/getStudentGroupByClazz`,
    studentName.length > 0 ? { studentName } : {},
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

/** 通过班级进行分组学生查询  */
export const getStudentGroupByClazzInSchool = (studentName: string) =>
  request<IGetStudentGroupByClazzRtn[]>(
    `/v1/frontend/clazzes/actions/getStudentGroupByClazzInSchool`,
    { studentName },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

export interface IGetClzFileRtn {
  clazzName: string;
  nickName?: string;
  clazzOperator: boolean;
  headTeacherName: string;
  id: string;
  parentCount: number;
  schoolName: string;
  studentCount: number;
  teacherCount: number;
  studentResps: any[];
  teacherResps: any[];
}

/** 获取班级档案 */
export const getClzFile = (clzId: string) =>
  request<IGetClzFileRtn>(`/v1/cuser/clazzes/${clzId}`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });

interface ICreateInviteToClazz {
  clazzId: string;
  needApprove: number;
}
/** 老师创建入班邀请信息 */
export const createInviteToClazz = (data: ICreateInviteToClazz) =>
  request<ICreateInviteToClazz>(`/v1/frontend/teachers/actions/createClazzInvite`, data, 'PUT', {
    spaceType: request.service.campusbase,
  });

/** 判断邀请信息是否有效 */
export const isValidateInvitation = (inviteId: string) =>
  request<boolean>('/anon/v1/frontend/teachers/actions/isValidateInvitation', { inviteId }, 'GET', {
    spaceType: request.service.person,
    defaultError: false,
    forc: true,
  });

export interface IGetClazzInvite {
  id: number;
  needApprove: number;
  clazzId: string;
  clazzName: string;

  inviter: string;

  inviterName: string;
  locationId: string;
  locationName: string;
}

/**  */
export const getClazzInvite = (inviteId: string) =>
  request<IGetClazzInvite>(
    '/anon/v1/frontend/teachers/actions/getClazzInvite',
    { inviteId },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

export interface ISubmitApplyToClazz {
  clazzId: string;
  inviteId: number;
  inviter: string;
  inviterName: string;
  locationId: string;
  applyParentVoList: {
    name: string;
    relationType: number;
    code: string;
    encryptedData: string;
    iv: string;
    appId: string;
  }[];
  applyStudentVo: {
    certificateNo?: string;
    certificateType?: number;
    gender: number;
    name: string;
    studentCode?: string;
  }[];
}

/** 家长提交申请入班 */
export const submitApplyToClazz = (data: ISubmitApplyToClazz) =>
  request('/anon/v1/frontend/parents/actions/submitClazzApply', data, 'PUT', {
    spaceType: request.service.campusbase,
    defaultError: false,
  });

export const needToProcessCount = () =>
  request('/v1/frontend/teachers/actions/needToProcessCount', {}, 'GET', {
    spaceType: request.service.campusbase,
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
  inviter: string;
  inviterName: string;
  clazzName: string;

  clazzId: string;
  approver: string;
  approverName: string;
  approveResult: number;
  approveDate: number;
}

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
  allergyTypeList: any[];
  allergyDetail: string | null;
  status: number;

  userId: number;
}

interface IStudentAddForm {
  baseInfoReq: IStudentAdd;
  voucherReq: CertificateInfo;
}

/** 新增学生 */
export const studentAdd = (params: IStudentAddForm) =>
  request('/v1/students/h5/save', params, 'POST', {
    spaceType: request.service.sas,
  });

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

/** 人脸特征数据对比 */
export const faceCompare = (params: { feature: string }) =>
  request(`/faces/actions/compare`, params, 'POST', { spaceType: request.service.vision });
/** 人脸上传base64图片 */
export const compareBase64 = (params: { feature: string }) =>
  request(`/faces/actions/compareBase64`, params, 'POST', {
    spaceType: request.service.vision,
    showLoading: false,
  });
/** 学生详情 */
export const studentDetail = (id: string) =>
  request<IStudentDetailRtnWrap>(`/v1/students/h5/detail/${id}`, {}, 'GET', {
    spaceType: request.service.sas,
  });

/** 图片base */
export const fileStreamBase64 = (fileId: string) =>
  request<string>(`/v1/frontend/file-stream/base64/${fileId}`, {}, 'GET');

/** 学生更新 */
export const studentEdit = (id: string, params: IStudentAddForm) =>
  request(`/v1/students/h5/update/${id}`, params, 'POST', { spaceType: request.service.sas });

/** 获取宿舍号 */
export interface IGetAccommodation {
  name: string;
  id: string;
}
export const getAccommodation = () =>
  request<IGetAccommodation[]>(`/space/accommodation`, {}, 'GET', {
    spaceType: request.service.space,
  });

/** 保存凭证信息 */
export const saveVoucher = (data: CertificateInfo) =>
  request(`/v1/vouchers/actions/save`, data, 'POST', {
    spaceType: request.service.sas,
    defaultError: false,
  });

export const getVoucher = ({ locationId, personType, personId }: CertificateDetailParams) =>
  request<IGetVoucherRtn>(`/v1/vouchers/${locationId}/${personType}/${personId}`, {}, 'GET', {
    spaceType: request.service.sas,
  });

interface IImgDetect {
  imgId: string;
  imgUrl: string;
  locationId?: string;
}
export interface IImgDetectRtn {
  pass: number;
  quality: number;
}
/**
 * 图片质量检测
 *  locationId 如果是C端，则必传, 因后端取不到
 */
export const imgDetect = (data: IImgDetect) =>
  request('/v1/face/ai/actions/detect?type=0', data, 'POST', {
    spaceType: request.service.sas,
    overdueShowLoadingTime: 10,
  });

/**
 * 图片质量检测--新--我的档案专用
 *  locationId 如果是C端，则必传, 因后端取不到
 */
export const imgDetectV2 = (data: IImgDetect, locationId: string) =>
  request(`/files/v3/face/ai/actions/detect?type=0&locationId=${locationId}`, data, 'POST', {
    spaceType: request.service.building,
    overdueShowLoadingTime: 10,
  });

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

export interface IGetClassesRtn {
  /** 班级学生数 */
  classStudents: number;
  /** 年级ID */
  gradeId: number | string;
  /** 年级名称 */
  gradeName: string;
  /** 年级类型：0、幼儿园；1、小学；2、初中；3、高中；4、大学；98、社团；99、兴趣班 */
  gradeType: number;
  /** 班主任名称串 */
  headTeacherNames: string | null;
  /** 班级ID */
  id: string;
  locationId: string;
  name: string;
  nickName: string;
  studentCount: number;
  /** 班级类型：0、行政班级；1、教学班级；2、社团；3、兴趣班 */
  type: number;
}

/**
 * 根据条件查询班级信息列表
 * @see http://192.168.5.20/project/631/interface/api/376487
 */
export const getClasses = (
  filters: Partial<{
    clazzIds: string[];
  }>,
) => {
  return request<IGetClassesRtn[]>('/v1/clazzes/actions/list', filters, 'POST', {
    spaceType: request.service.campusbase,
  });
};

// TODO 我们还剩下一个按照专业获取学生数量的API接口
type IGetMajorsRtn = {
  academyId: number | string;
  code: string;
  eduSystem: number;
  deleted: number;
  id: number | string;
  locationId: number | string;
  maxGradeLevel: number;
  minGradeLevel: number;
  name: string;
  schMajorRelVOList: {
    bizId: number | string;
    bizName: string;
    /** 业务类型，默认是1，表示负责人 */
    bizType: number;
    id: number | string;
    locationId: number | string;
    majorId: 74536064;
  }[];
  sectionId: number | string;
  studentCount: number;
};
/**
 * 根据id批量获得专业详情
 * @param filters
 * @returns
 */
export const getMajors = (
  filters: Partial<{
    ids: string[];
  }>,
) => {
  return request<IGetMajorsRtn[]>(
    '/schMajors/getByIds',
    {
      ids: (filters.ids || []).join(','),
    },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );
};

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
