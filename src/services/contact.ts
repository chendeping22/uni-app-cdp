import { request } from '@/utils/request';

export interface IRefItem {
  el: any;
  id: IStuContact;
}
export interface IStuContact {
  collapseItem?: IGetClazzListRtn;
  isExpense: boolean;
  isShowLoading: boolean;
  childItems?: IStudentResps[];
}

export interface IUserAuthInfo {
  locationId: string; // 组织ID
  userId: string; // 用户ID
  isAdmin: boolean; // 是否是超级管理员
  isNormalAdmin: boolean; // 是否是管理员角色
  isSchoolMaster: boolean; // 是否是学校管理员
  sectionIdList: string[]; // 学段id（学段负责人）
  gradeIdList: string[]; // 年级id（年段长）
  masterClazzIdList: string[]; // 班级id（班主任）
  teachClazzIdList: string[]; // 班级id（任课老师）
}

/**
 * 根据班主任ID获取班级列表
 * @param id
 * @returns
 */
export const getUserAuthInfoVo = () => {
  return request<IUserAuthInfo>('/v2/teachers/action/getUserAuthInfoVo', {}, 'GET', {
    spaceType: request.service.campusbase,
    defaultError: false,
    showLoading: false,
  });
};

export interface IGetClazzListRtn {
  schoolName: string;
  gradeName: string;
  id: string;
  name: string;
  space: string;
  studentCount: number;
  gradeId: string;
  sectionId: string;
}

/**
 * 根据班主任ID获取班级列表
 * @param id
 * @returns
 */
export const getClazzList = (defaultError = true) => {
  return request<IGetClazzListRtn[]>(
    '/v1/cuser/teachers/actions/getAllClazzInfoByTeacherRole',
    {},
    'GET',
    {
      spaceType: request.service.campusbase,
      defaultError,
      showLoading: false,
    },
  );
};

/**
 * 获取班级档案信息
 */
export interface IStudentResps {
  firstLetter: string;
  gender: number; // 2、女；1、男
  id: number;
  imageUrl: string; // 学生数据
  photoUrl: string; // 搜索到的学生数据
  isContacts: number; // 0、否；1、是
  mobilePhone: string;
  name: string;
  parentId: number;
  parentName: string;
  relation: number; // 0、父亲；1、母亲；2、爷爷；3、奶奶；4、外公；5、外婆；99、其他
  studentCode: string;
}

export interface ITeacherResps {
  gender: number; // 2、女；1、男
  id: number;
  mobilePhone: string;
  imageUrl: string;
  name: string;
  subject: string;
  type: number; // 0、班主任；1、任课老师
}

export interface IgetclazzFileRtn {
  headTeacherName: string;
  id: number;
  parentCount: number;
  schoolName: string;
  teacherCount: number;
  studentResps: IStudentResps[];
  teacherResps: ITeacherResps[];
}

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

export const getclazzFile = (id: string, defaultError = true) => {
  return request<IgetclazzFileRtn>(`/v1/cuser/clazzes/${id}`, {}, 'GET', {
    spaceType: request.service.campusbase,
    showLoading: false,
    defaultError,
  });
};

export interface IGetDeptListRtn {
  id: string;
  parentId: string;
  parentName?: string;
  name?: string;
  locationId: string;
  departmentName?: string;
  level: number;
  departmentPersonNum: number;
  children: IGetDeptListRtn[];
}

/**
 * 获取部门树
 */
export const getDeptTreeDataNew = () => {
  return request<IGetDeptListRtn[]>('/department/frontend/tree', { searchValue: '' }, 'GET', {
    spaceType: request.service.auth,
  });
};

export const getDeptTreeData = () => {
  return request<IGetDeptListRtn[]>(
    '/v1/departments/actions/tree',
    { includeOutPerson: '0', needStaySpace: '0' },
    'POST',
    {
      spaceType: request.service.building,
    },
  );
};

export interface IGetDeptPeopleNumRtn {
  departmentId: string;
  departmentName?: string;
  departmentPersonNum: number;
}

/**
 * 查询部门人数
 * cascade:是否只统计当前部门 [1: 包子集 0：当前部门]
 */
export const getDeptPeopleNum = (departmentIds: string[]) => {
  return request<IGetDeptPeopleNumRtn[]>(
    '/v1/departments/actions/countDepartmentPersonNum',
    { departmentIds: departmentIds, cascade: '1' },
    'POST',
    {
      spaceType: request.service.auth,
      showLoading: false,
    },
  );
};

export interface IGetUserList {
  condition?: string;
  pageNum: number;
  pageSize: number;
  departmentId?: string;
}

export type IRequestList<T> = {
  total: number;
  pageSize: number;
  pageNumber: number;
  result: T;
};

export interface IGetUserListRtn {
  name: string;
  nickname: string;
  roleName?: string;
  id: string;
  departmentName?: string;
  gender: number;
  tel: string;
  headImageId?: string;
  headImageUrl?: string;
  position?: string;
}

/** 获取教职工 */
export const getUserList = (data: IGetUserList) =>
  request<IRequestList<IGetUserListRtn[]>>(
    '/v1/userManagement/actions/pageUser4Mobile',
    data,
    'POST',
    {
      spaceType: request.service.auth,
    },
  );

export interface ISearchResult {
  clazzId: string;
  studentReList?: IStudentResps[];
}

export const searchByKeyword = (locationId: string, keyword: string) => {
  return request<ISearchResult[]>(
    '/v2/students/actions/searchByConditionAndGroupByClazzId',
    {
      filterAuthorizeClazz: true,
      locationId: locationId,
      keyWord: keyword,
      keyWordSkipForCertificateNumber: 1,
    },
    // { filterAuthorizeClazz: true, locationId: locationId, keyWord: keyword, keyWordForNameOnly: 1 },
    'POST',
    {
      spaceType: request.service.campusbase,
    },
  );
};

interface ICreateInviteToClazz {
  clazzId: string;
  needApprove: number;
}
/** 老师创建入班邀请信息 */
export const createInviteToClazz = (data: ICreateInviteToClazz) =>
  request<string>(`/v1/frontend/teachers/actions/createClazzInvite`, data, 'PUT', {
    spaceType: request.service.campusbase,
  });

// 拼接学生列表
export const makeStudentOptions = (studentResps: IStudentResps[]) => {
  // 1. 生成以首字母为key的对象, 并排序
  const first = studentResps
    .map(s => ({
      firstLetter: (s.firstLetter || '#').substr(0, 1).toUpperCase(),
      data: {
        desc: '学号:' + (s.studentCode || '/'),
        phoneContactName: s.parentName,
        photoUrl: s.imageUrl,
        urgencyParentType: s.relation,
        urgencyParent: s.parentName,
        urgencyParentMobilePhone: s.mobilePhone,
        ...s,
      },
    }))
    ?.sort((left, right) => (left.firstLetter < right.firstLetter ? -1 : 1));

  // 2. 按首字母分类
  const second = {} as { [k: string]: any[] };
  first.forEach(t => {
    if (!second[t.firstLetter]) {
      second[t.firstLetter] = [t.data];
    } else {
      second[t.firstLetter].push(t.data);
    }
  });

  // 3. 转为符合组件格式的数据
  return Object.entries(second).map(arr => ({
    char: arr[0],
    dataList: arr[1],
  }));
};

export const needToProcessCount = () =>
  request<number>('/v1/frontend/teachers/actions/needToProcessCount', {}, 'GET', {
    spaceType: request.service.campusbase,
  });

export const getSchoolNameByLocationId = (locationId: string) =>
  request<string>(`/v1/schools/name/${locationId}`, {}, 'GET', {
    spaceType: request.service.campusbase,
    defaultError: false,
  });

/**
 * 根据教职工id获取教职工人员详情
 * @param id
 * @returns
 */

export interface StaffUserInfoState {
  name: string;
  locationName: string;
  deptStr: string;
  pluralismDeptStr: string;
  position: string;
  tel: string;
  headImgUrl: string;
  gender: number | null;
  id: string;
  locationId: string;
  onDutyStatus: number;
  locationLevel: number;
  userDepartmentRes: any[];
}
export const getStaffUserInfo = (id: string) => {
  return request<StaffUserInfoState>(`/v1/userManagement/${id}`, {}, 'GET', {
    spaceType: request.service.building,
    defaultError: false,
    showLoading: false,
  });
};
/**
 * 添加常用联系人
 * @param id
 * @returns
 */
export const addStaffFrequentContacts = (id: string) => {
  return request(`/userFrequentContacts`, { userId: id }, 'POST', {
    spaceType: request.service.auth,
    defaultError: false,
    showLoading: false,
  });
};
/**
 * 删除常用联系人
 * @param id
 * @returns
 */
export const delStaffFrequentContacts = (id: string) => {
  return request(`/userFrequentContacts/${id}`, {}, 'DELETE', {
    spaceType: request.service.auth,
    defaultError: false,
    showLoading: false,
  });
};
/**
 * 判断当前用户是否为常用联系人
 * @param id
 * @returns
 */
interface ExitFrequentContactsRsp {
  existing: boolean;
}
export const existStaffFrequentContacts = (id: string) => {
  return request<ExitFrequentContactsRsp>(`/userFrequentContacts/exist/${id}`, {}, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
    showLoading: false,
  });
};
export const commonUser = (data: any) =>
  request<string>(`/userFrequentContacts/actions/queryPage`, data, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
  });
export const findSub = () =>
  request<string>(`/v1/frontend/locations/actions/findSub`, {}, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
  });
export const findSub2 = (params: any) =>
  request<string>(`/department/frontend/${params.locationId}/list`, params, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
  });
export const getdepartmentTree = (locationId: string) =>
  request<string>(`/department/frontend/tree/${locationId}`, {}, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
  });
