import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { request } from '@/utils/request';
export interface IMedalInfoItem {
  id: string; //勋章ID
  medalCategoryId: string; //勋章分类ID
  name: string; //勋章名称
  icon: string; //图标
  medalCount: number; //勋章总数
}
export interface IStudentInfoItem {
  studentId: string; //学生ID
  clazzId: string; //班级ID
  locationId: string; //组织ID
  studentName: string; //学生名称
  clazzName: string; //班级名称
  studentCode: string; //学籍号
  gender: number; //性别1男 2女
  imageUrl: string;
  crown: number; //皇冠数
  diamond: number; //钻石数
  badge: number; //徽章数
  star: number; //星星数
  starCount: number; //星星总数
  medalInfos: IMedalInfoItem[];
}

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

export const getSpaceType = () => {
  const store = loginStore();
  return EUserType.teacher !== store.currentUserType ? 'observes/cus' : 'observes';
};

export const getStudents = (clazzId: string) =>
  request<IStudentInfoItem[]>(
    `/medal/medalStudentRecords/actions/findByClazzId/${clazzId}`,
    {},
    'GET',
    {
      spaceType: request.service.quality,
    },
  );

/** 获取学生勋章及星星数 */
export const getStudentMedal = (studentId: string) =>
  request(`/medal/medalStudentRecords/actions/findByStudentId/${studentId}`, {}, 'GET', {
    spaceType: request.service.quality,
  });

/** 获取所有勋章 */
export const getAllCategory = () =>
  request(`/medal/medalCategorys/actions/getAllCategory`, {}, 'GET', {
    spaceType: request.service.quality,
  });

/** 1-点亮星星、2-勋章 */
export const saveStarOrMedal = (params: any) =>
  request(`/medal/medalStudentRecords/actions/save`, params, 'POST', {
    spaceType: request.service.quality,
  });
