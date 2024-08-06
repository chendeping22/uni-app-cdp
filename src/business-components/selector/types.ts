import { PersonItemLevelEnum, StudentItemLevelEnum } from '@/components/selector/types';

export interface Layered {
  id: string;
  name: string;
  level: PersonItemLevelEnum | StudentItemLevelEnum;
  /** 主要子节点 */
  children?: string[];
  /** 次要子节点 */
  avatar?: string;
  subChildren?: string[];
  isFetching?: boolean;
  hasFetched?: boolean;
  disabled?: boolean;
  /** 是否展示可选框 */
  isCheckbox?: boolean;
  identifier?: string;
  position?: string;
  locationName?: string;
  /** 手机号 */
  phone?: string;
  /** 工号 */
  jobNo?: string;
  /** 姓名拼音首字母 */
  firstLetter?: string;
  schoolType?: number;
  schoolGradeList?: number[];
}

/**
 * 组织级别
 */
export enum LocationLevel {
  /** 0: 管理单位，局端 */
  Bureau,
  /** 1: 执行单位，校端 */
  School,
}

export type EntityType = 'student' | 'person' | 'role' | 'location';

// schoolType 办学主体, 0公办 1民办 2私立
export enum SchoolTypeEnum {
  /** 0：公立 */
  public,
  /** 1：私立 */
  private,
}

export const SchoolTypeOptions = [
  {
    label: '公立',
    value: SchoolTypeEnum.public,
  },
  {
    label: '私立',
    value: SchoolTypeEnum.private,
  },
];

// schoolGradeList   0 幼儿园 1小学 2初中 3高中 4 大学 5中高职
export enum SchoolGradeTypeEnum {
  /** 0：幼儿园 */
  kindergarten,
  /** 1：小学 */
  elementary,
  /** 2：初中 */
  middle,
  /** 3：高中 */
  high,
  /** 4：大学 */
  university,
  /** 5：中高职 */
  vocational,
}

export const SchoolGradeTypeOptions = [
  {
    label: '幼儿园',
    value: SchoolGradeTypeEnum.kindergarten,
  },
  {
    label: '小学',
    value: SchoolGradeTypeEnum.elementary,
  },
  {
    label: '初中',
    value: SchoolGradeTypeEnum.middle,
  },
  {
    label: '高中',
    value: SchoolGradeTypeEnum.high,
  },
  {
    label: '大学',
    value: SchoolGradeTypeEnum.university,
  },
  {
    label: '中高职',
    value: SchoolGradeTypeEnum.vocational,
  },
];
