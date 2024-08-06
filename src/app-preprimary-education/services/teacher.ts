import { request } from '@/utils/request';

export interface IGetClazzListRtn {
  gradeName: string;
  id: string;
  name: string;
  space: string;
  studentCount: number;
}

/**
 * 根据班主任ID获取班级列表
 * @param id
 * @returns
 */
export const getClazzList = (defaultError = true) => {
  return request<IGetClazzListRtn[]>('/v1/cuser/teachers/actions/getClazzList', {}, 'GET', {
    spaceType: request.service.campusbase,
    defaultError,
  });
};

/**
 * 获取班级档案信息
 */
export interface IStudentResps {
  firstLetter: string;
  gender: number; // 2、女；1、男
  id: number;
  imageUrl: string;
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
export const getclazzFile = (id: string) => {
  return request<IgetclazzFileRtn>(`/v1/cuser/clazzes/${id}`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
};

export type IClassList = {
  clazzId: string;
  clazzName: string;
};

/**
 * 获取离园接送班级列表(班主任/科任老师)
 * @returns
 */
export const getClassListById = () => {
  return request<IClassList[]>('/teachers/actions/getClazzList', {}, 'GET', {
    spaceType: request.service.pickup,
  });
};
