/**
 * 存放所有storage的key
 * 命名规则: {name}_key
 * 有全局通用和临时使用之分
 */

const { miniProgram } = uni?.getAccountInfoSync?.() || {};
const { appId, envVersion } = miniProgram ?? {};

// 取环境类型
const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const VITE_COMPOSITION = import.meta.env.VITE_COMPOSITION;

/** 生成storage的key */
export const makeStorageKey = (key: string) => {
  let storage_key = '';
  // #ifdef MP-WEIXIN
  storage_key = `${appId}_${envVersion}_${key}`;
  // #endif

  // #ifdef H5
  storage_key = `${VITE_COMPOSITION}_${VITE_SERVER_ENV}_${key}`;
  // #endif

  // #ifdef APP-PLUS
  storage_key = `APP_${VITE_SERVER_ENV}_${VITE_COMPOSITION}_${key}`;
  // #endif
  return storage_key;
};

/** ===========================以下是全局通用的key==================== */
/** 云边探测地址的key */
export const cur_service_url_key = makeStorageKey('cur_service_url');
/** 部署方式的key */
export const deployWay_key = makeStorageKey('deployWay');
/** 消息推送push的cid的key */
export const cid_key = makeStorageKey('cid');
/** 配置的服务器地址的key */
export const server_url_key = makeStorageKey('server_url');
export const server_config_key = makeStorageKey('server_config');
/** 全局配置 */
export const global_config_key = makeStorageKey('global_config');
/** 全局配置 */
export const app_version_config_key = makeStorageKey('app_version_config');
/** app的cid, 本地生成, 若退出若token失效需要重新生成 */
export const clientId_key = makeStorageKey('clientId');
/** 存储获取token时间 */
export const tokenTime_key = makeStorageKey('tokenTime');
/** 存储app所需的缓存数据 */
export const app_key = makeStorageKey('app');
/** 存储学生通讯录数据 */
export const contacts_student_clazz_key = makeStorageKey('contactsStudentClazz');
export const contacts_student_key = makeStorageKey('contactsStudent');
/** 打卡详情, 有效的onShow事件(打卡完成返回后刷新详情), 用完即删除, 其它情况不触发 */
export const clockinDetailEffectOnShow_key = makeStorageKey('clockinDetailEffectOnShow');
export const noticeUpdateTime = makeStorageKey('notice_update_time');
/** 存储工作台小组件顺序的缓存数据 */
export const workbench_widget_sort_key = makeStorageKey('workbench_widget_sort');
