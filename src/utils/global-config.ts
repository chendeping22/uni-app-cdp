import {
  app_version_config_key,
  global_config_key,
  server_config_key,
  server_url_key,
} from './storage-keys';

const DEFAULT_CONFIG_VALUE = {
  server_host: import.meta.env.VITE_SERVER_URL,
  imp2_h5_host: import.meta.env.VITE_SERVER_URL_OLD,
  imp2_stu_h5_host: import.meta.env.VITE_STU_SERVER_URL_OLD,
  imp2_edu_h5_host: import.meta.env.VITE_EDU_SERVER_URL_OLD,
  imp2_training_h5_host: import.meta.env.VITE_TRAINING_SERVER_URL,
  lowcode_host: import.meta.env.VITE_LOW_CODE_SERVER_URL.replace(/\/h5\/?$/i, ''),
  lowcode_h5_host: import.meta.env.VITE_LOW_CODE_SERVER_URL,
};

export type ConfigKeyType = keyof typeof DEFAULT_CONFIG_VALUE;

export type ConfigType = Record<ConfigKeyType, string>;

interface RemoteConfigType {
  imp?: string;
  boss?: string;
  lowcode?: string;
  xingpan?: string;
  /** 禁用扫码登录 */
  disableScan?: boolean;
  /** 禁用短信登录 */
  disableSMS?: boolean;
}

interface ConfigCommonOptions {
  /** 禁用存储 */
  disableStorage?: boolean;
}

const CONFIG: {
  value: ConfigType;
  remote: RemoteConfigType;
  appVersion?: Record<string, string>;
} = {
  value: { ...DEFAULT_CONFIG_VALUE },
  remote: {},
  // #ifndef MP-WEIXIN
  appVersion: {},
  // #endif
};

export function initConfig() {
  // #ifndef MP-WEIXIN
  CONFIG.appVersion = uni.getStorageSync(app_version_config_key) || {};
  // #endif

  const config = uni.getStorageSync(global_config_key) || {};
  setConfig(config, { disableStorage: true });

  // first, load from storage
  const server_config = uni.getStorageSync(server_config_key);
  if (server_config) {
    setRemoteConfig(server_config);
  }

  // then, load from remote
  let server_url = uni.getStorageSync(server_url_key);
  if (server_url) {
    /** NOTE: 兼容旧配置 */
    if (CONFIG.value.server_host !== server_url) {
      fetchRemoteConfig(server_url).then(() => {
        // #ifndef MP-WEIXIN
        fetchAppVersionConfig(CONFIG.value.server_host);
        // #endif
      });
    }
  } else {
    server_url = DEFAULT_CONFIG_VALUE.server_host;
    // NOTE: 测试环境接口采用外网映射地址，不支持json文件的请求，故转化为内网地址进行请求
    if (/^TEST\d?$/i.test(import.meta.env.VITE_SERVER_ENV)) {
      const match = server_url.match(/\:(\d+)\/?/);
      if (match) {
        server_url = {
          12001: 'https://test-imp.lexikos.com/',
          18001: 'https://test2-imp.lexikos.com/',
        }[match[1]];
      }
    }
    // NOTE: 本地开发版时存在.env.local配置文件的环境变量替换操作，若请求线上配置，则本地配置无效
    if (import.meta.env.PROD) {
      fetchRemoteConfig(server_url, { disableStorage: true }).finally(() => {
        uni.removeStorage({ key: server_url_key });
        uni.removeStorage({ key: server_config_key });
        uni.removeStorage({ key: global_config_key });
      });
    }
    // #ifndef MP-WEIXIN
    fetchAppVersionConfig(server_url);
    // #endif
  }

  console.debug('[CONFIG] init', CONFIG.value);
  return CONFIG.value;
}

export function getConfig() {
  return CONFIG.value;
}

export function getAppVersion() {
  return CONFIG.appVersion;
}

export function setConfig(config: Partial<ConfigType>, options: ConfigCommonOptions = {}) {
  if (config && Object.keys(config).length) {
    const result: Partial<ConfigType> = {};
    for (const [key, value] of Object.entries(config)) {
      if (
        value &&
        Object.prototype.hasOwnProperty.call(CONFIG.value, key) &&
        CONFIG.value[key as ConfigKeyType] !== value
      ) {
        result[key as ConfigKeyType] = value;
      }
    }

    if (Object.keys(result).length) {
      if (!options.disableStorage) {
        uni.setStorage({
          key: global_config_key,
          data: result,
        });
      }

      CONFIG.value = {
        ...CONFIG.value,
        ...result,
      };
    }
  }
}

export function getServerUrl() {
  return uni.getStorageSync(server_url_key);
}

export function fetchRemoteConfig(serverUrl?: string, options: ConfigCommonOptions = {}) {
  let url = '';

  if (typeof serverUrl === 'string' && /^https?:\/\//i.test(serverUrl)) {
    url = serverUrl.replace(/\/?(config.json)?$/i, '/config.json');
  } else if (import.meta.env.DEV) {
    url = import.meta.env.VITE_SERVER_URL + '/config.json';
  }

  if (!url) {
    return Promise.reject('serverUrl 参数为空');
  }

  const resultPromise = new Promise((resolve, reject) => {
    uni.request({
      url,
      success: res => {
        console.debug('[CONFIG] fetch', url, res);
        if (res.statusCode === 200 && res.data && typeof res.data === 'object') {
          if (!options.disableStorage) {
            if (serverUrl) {
              uni.setStorage({
                key: server_url_key,
                data: serverUrl,
              });
            }
            uni.setStorage({
              key: server_config_key,
              data: res.data,
            });
          }
          // res.data.disableSMS = true;
          CONFIG.remote = res.data as any;
          setRemoteConfig(res.data, options);
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject,
    });
  });

  resultPromise.catch(() => {
    uni.removeStorage({ key: server_url_key });
  });

  return resultPromise;
}

export function getRemoteConfig(key: keyof RemoteConfigType) {
  return CONFIG.remote[key];
}

export function getAllRemoteConfig() {
  return CONFIG.remote;
}

function setRemoteConfig(remoteConfig: any = {}, options: ConfigCommonOptions = {}) {
  const result: Partial<ConfigType> = {};
  if (remoteConfig.imp) {
    const host = remoteConfig.imp.replace(/\/$/, '');
    result.server_host = host;
    result.imp2_h5_host = host + '/imp2/h5';
    result.imp2_stu_h5_host = host + '/imp2-stu/h5';
    result.imp2_edu_h5_host = host + '/imp2-edu/h5';
    result.imp2_training_h5_host = host + '/voc-h5';
  }
  if (remoteConfig.lowcode) {
    result.lowcode_host = remoteConfig.lowcode;
    result.lowcode_h5_host = remoteConfig.lowcode.replace(/\/?$/i, '/h5');
  }
  setConfig(result, options);
}

export function cleanRemoteConfig() {
  uni.removeStorageSync(server_config_key);
  uni.removeStorageSync(server_url_key);
  CONFIG.remote = {};
  CONFIG.value = { ...DEFAULT_CONFIG_VALUE };
}

function fetchAppVersionConfig(serverUrl?: string) {
  let url = '';

  if (typeof serverUrl === 'string' && /^https?:\/\//i.test(serverUrl)) {
    url = serverUrl.replace(/\/?(mobile-app-version.json)?$/i, '/mobile-app-version.json');
  } else if (import.meta.env.DEV) {
    url = import.meta.env.VITE_SERVER_URL + '/mobile-app-version.json';
  }

  if (!url) {
    return Promise.reject('serverUrl 参数为空');
  }

  const resultPromise = new Promise((resolve, reject) => {
    uni.request({
      url,
      success: res => {
        console.debug('[CONFIG] fetch app version', url, res);
        if (res.statusCode === 200 && res.data && typeof res.data === 'object') {
          CONFIG.appVersion = res.data as any;
          uni.setStorage({
            key: app_version_config_key,
            data: res.data,
          });
          resolve(res.data);
        } else {
          CONFIG.appVersion = {};
          uni.removeStorage({ key: app_version_config_key });
          reject(res);
        }
      },
      fail: reject,
    });
  });

  return resultPromise;
}
