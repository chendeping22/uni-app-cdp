export enum ETerminal {
  H5 = 'MobileH5',
  Wechat = 'Wechat',
  Android = 'Android',
  iOS = 'IOS',
}

export interface IApp {
  appCode: string;
  appId: string;
  appName: string;
}

/** 用户类型 */
export enum UserIdentity {
  /** IMP B 端用户 */
  Imp,
  /** 麦塔家校端学生用户 */
  MetaStudent,
  /** 麦塔家校端家长用户 */
  MetaGuardian,
}

export interface ITreePermission {
  id?: string;
  client: number;
  permissionCode: string;
  permissionName: string;
  nameCn?: string;
  iconSrc?: string;
  childs?: ITreePermission[];

  sort?: number;
  [key: string]: any;
}

export interface IStudents {
  id: string;
  name: string;
  relation: number;
  clazzId: string;
  clazzName: string;
  nickName: string;
}
/** 用户类型 */
export enum IAdminStatus {
  /** 超管人员*/
  admin = 1,
  /** 普通*/
  ordinary,
}
export interface IUserInfo {
  accountId: string; // 账号ID
  id: string; // 教师端的userId, 仅教师端使用
  userId: string; // 家长的userId， 仅家长端使用
  personId: string; // 家长id ()
  name: string; //家长名称
  mobilePhone: string; // 家长手机
  userName: string;
  phone: string;
  tel: string;
  position: string; // 职位
  headImageUrl?: string;
  mqttHost?: string;
  mqttPassword?: string;
  mqttUuid?: string;
  mqttHostProtocol?: string;
  locationId: string; // 组织Id
  locationType: string; // 组织类型
  appList: IApp[];
  applications: IApp[];
  students: IStudents[];
  userIdentity?: UserIdentity;
  [key: string]: any;
  deptId?: string;
  deptName?: string;
  containsQuery: boolean;
  childIds: number[]; //全部小孩
  adminStatus: IAdminStatus;
}

export interface IAuthInfo {
  accessToken: string;
  tokenExpire: number;
  refreshToken: string;
  refreshExpire: number;
  tokenHeaderName?: string; //服务器下发head里面token的name
  studentId?: string;
}

export interface IEnv {
  online?: string;
  terminal?: ETerminal;
}
