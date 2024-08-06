// import type { ISpace } from '@/services/homePage';
// import { TEnvType } from '@/utils/env';
// import { StoreOptions } from 'vuex';
// import { ENV_COMMITS } from '../types';

// /**
//  * 组织类型，分为幼儿园，K12，中高职，大学
//  */
// enum LocationType {
//   /** 幼儿园 */
//   PreSchool = 'Pre:School',
//   /** K12 */
//   K12 = 'K12',
//   /** 中高职 */
//   SecondaryVocational = 'Secondary:Vocational',
//   /** 大学 */
//   College = 'College',
// }

// export interface ITreePermission {
//   id?: string;
//   client: number;
//   permissionCode: string;
//   permissionName: string;
//   nameCn?: string;
//   iconSrc?: string;
//   childs?: ITreePermission[];

//   sort?: number;
//   [key: string]: any;
// }

// export interface IApp {
//   appCode: string;
//   appId: string;
//   appName: string;
// }

// /** 用户类型 */
// export enum UserIdentity {
//   /** IMP B 端用户 */
//   Imp,
//   /** 麦塔家校端学生用户 */
//   MetaStudent,
//   /** 麦塔家校端家长用户 */
//   MetaGuardian,
// }

// export interface IUserInfo {
//   id: string; // 教师端的userId, 仅教师端使用
//   userId: string; // 家长的userId， 仅家长端使用
//   personId: string; // 家长id ()
//   name: string; //家长名称
//   mobilePhone: string; // 家长手机
//   userName: string;
//   phone: string;
//   mqttHost?: string;
//   mqttPassword?: string;
//   mqttUuid?: string;
//   mqttHostProtocol?: string;
//   locationId: string;
//   locationType: string;
//   treePermissions: ITreePermission[];
//   appList: IApp[];
//   applications: IApp[];
//   userIdentity?: UserIdentity;
//   [key: string]: any;
// }

// export interface IAuthInfo {
//   code: string;
//   openid: string;

//   encryptedData: string;
//   iv: string;
//   env_type?: TEnvType;
//   appId?: string;

//   accessToken: string;
//   cuserToken?: string;
//   loginMode: number;
//   mqttHost?: string;
//   mqttPassword?: string;
//   mqttHostProtocol?: string;
//   mqttUuid?: string;

//   websocketAddress?: string;
//   studentId?: string;

//   isGuardian?: boolean; // guardian | teacher
//   appKind?: string | undefined; // h5: guardian | teacher | undefined
//   appCode?: string | undefined; // h5: permission code | undefined
// }

// export enum ELoginMode {
//   'wx' = 0,
//   'phone' = 1,
// }

// export enum ERunEnv {
//   weixin = 'mp-weixin',
//   app = 'app',
//   h5 = 'h5',
// }
// export interface IEnvType {
//   runEnv?: ERunEnv;
//   api: string;
//   businessType: 'km' | 'hb' | 'mt';
//   mqtt_url: string;
//   mqtt_port: number;
// }

// export interface IEnv extends IEnvType {
//   code: string;
//   authInfo: IAuthInfo;
//   userInfo: IUserInfo;
//   clientId: string;
//   online: string;
//   /** 小程序是否在前台 */
//   isActive: boolean;
//   appPermissions: ITreePermission[];
//   space: ISpace;
//   permissionSpace: ISpace;
// }

// type IMutations = {
//   [k in ENV_COMMITS]: (state: IEnv, payload: any) => void;
// };

// const initialState: IEnv = {
//   /** 当前页面是否运行在容器中 */
//   runEnv: undefined,
//   api: '',
//   mqtt_port: 0,
//   mqtt_url: '',
//   code: '',
//   isActive: false,
//   businessType: 'mt',
//   authInfo: {
//     code: '',
//     openid: '',
//     accessToken: '',
//     loginMode: ELoginMode.wx,
//     encryptedData: '',
//     iv: '',
//     appId: '',
//     appKind: '',
//   },
//   userInfo: {
//     id: '-99999999',
//     userId: '-99999999',
//     personId: '',
//     userName: 'your name',
//     nickname: '1111',
//     name: 'your name',
//     phone: '13012345678',
//     mobilePhone: '13012345678',
//     headImg: 'my_headphoto_1.png',
//     locationId: '',
//     treePermissions: [],
//     isFromApp: 0,
//   },
//   clientId: '',
//   online: true,
//   appPermissions: [],
//   space: {
//     id: '',
//     name: '',
//     onTotal: 0,
//     filterCode: '',
//     haveChild: false,
//     spaceBreads: [],
//   },
//   permissionSpace: {
//     id: '',
//     name: '',
//     onTotal: 0,
//     filterCode: '',
//     haveChild: false,
//     spaceBreads: [],
//   },
// };

// const mutations: IMutations = {
//   [ENV_COMMITS.setUserInfo](state, payload: IUserInfo) {
//     state.userInfo = payload;
//   },
//   [ENV_COMMITS.setRunEnv](state, payload: IEnvType['runEnv']) {
//     state.runEnv = payload;
//   },
//   [ENV_COMMITS.setOnline](state, payload: boolean) {
//     state.online = payload;
//   },
//   [ENV_COMMITS.setCode](state, payload: string) {
//     state.code = payload;
//   },
//   [ENV_COMMITS.setClientId](state, payload: string) {
//     state.clientId = payload;
//   },
//   [ENV_COMMITS.setEnv](state, payload: IEnv) {
//     state = payload;
//   },
//   [ENV_COMMITS.setAppPermissions](state, payload) {
//     state.appPermissions = payload;
//   },
//   [ENV_COMMITS.setAuthInfo](state, payload: IAuthInfo) {
//     state.authInfo = payload;
//   },
//   [ENV_COMMITS.setEnvType](state, payload: IEnvType) {
//     const { api, businessType, mqtt_url = '', mqtt_port = '' } = payload;
//     Object.assign(state, { api, businessType, mqtt_url, mqtt_port });
//   },
//   [ENV_COMMITS.setSpace](state, payload) {
//     state.space = { ...state.space, ...payload };
//   },
//   [ENV_COMMITS.setSpaceBreads](state, payload) {
//     state.space = { ...state.space, spaceBreads: payload };
//   },
//   [ENV_COMMITS.setPermissionSpace](state, payload) {
//     state.permissionSpace = { ...state.permissionSpace, ...payload };
//   },
//   [ENV_COMMITS.setPermissionSpaceBreads](state, payload) {
//     state.permissionSpace = { ...state.permissionSpace, spaceBreads: payload };
//   },
// };

// export default {
//   state: () => initialState,
//   mutations,
// } as StoreOptions<IEnv>;

// export { LocationType };
