/** 单个应用类型*/
export type TSingleKindType = 'teacher' | 'student' | 'guardian';

/** 用户类型 */
export enum EUserType {
  /** 老师 */
  teacher = 0,
  /** 学生 */
  student = 1,
  /** 家长 */
  guardian = 2,
}

export const initUserType = () => {
  const kinds: TSingleKindType[] = import.meta.env.VITE_COMPOSITION.split('_');
  if (kinds.length < 2) {
    return getUserType(kinds[0]);
  }
  // 默认取第一个
  return getUserType(kinds[0]);
};

export const getUserTypes = () => {
  const kinds: TSingleKindType[] = import.meta.env.VITE_COMPOSITION.split('_');
  const userTypes: EUserType[] = [];
  kinds.forEach((value: TSingleKindType) => {
    userTypes.push(getUserType(value));
  });
  return userTypes;
};

export const getUserType = (kind: TSingleKindType) => {
  let userType: EUserType = EUserType.teacher;
  if (kind == 'teacher') {
    userType = EUserType.teacher;
  } else if (kind === 'guardian') {
    userType = EUserType.guardian;
  } else if (kind === 'student') {
    userType = EUserType.student;
  }
  return userType;
};

export const getSingleKindType = (userType: EUserType) => {
  let singleKindType: TSingleKindType = 'teacher';
  switch (userType) {
    case EUserType.teacher:
      singleKindType = 'teacher';
      break;
    case EUserType.student:
      singleKindType = 'student';
      break;
    case EUserType.guardian:
      singleKindType = 'guardian';
      break;
  }
  return singleKindType;
};

// 是否组合应用
export const combinedApp = () =>
  import.meta.env.VITE_COMPOSITION.split('_').length > 1 ? true : false;
