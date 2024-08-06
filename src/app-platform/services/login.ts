import { getUserTypes } from '@/utils/kind';
import { request } from '@/utils/request';
import { PlatformType } from '../login/utils';
import { getWxCode } from '../utils/tools';

/** 判断当前微信账号是否已注册（对应 unionId 绑定了账号） */
export const checkIsUnionIdRegistered = async () => {
  const code = await getWxCode();
  const {
    miniProgram: { appId },
  } = uni.getAccountInfoSync();
  return request<{ isRegister: boolean; unionid: string }>(
    '/anon/mobile/wxa/isRegister',
    {
      code,
      appId,
    },
    'POST',
    {
      spaceType: request.service?.building,
      defaultError: false,
    },
  );
};

/**
 * 微信一键登录接口
 * @param appId
 * @param unionid
 */
export const wxOneKeyLogin = async (appId: string, unionid: string, clientId: string) => {
  return request(
    '/anon/mobile/wxa/oneClickEnroll',
    { appId, unionid, userTypes: getUserTypes(), clientId },
    'POST',
    {
      spaceType: request.service?.building,
    },
  );
};

/**
 * 微信授权登录
 * @param appId
 * @param code
 * @param phoneCredentialsCode
 */
export const requestWxAuthLogin = (
  appId: string,
  code: string,
  phoneCredentialsCode: string,
  clientId: string,
) => {
  return request(
    '/anon/mobile/wxa/phoneAuthorization',
    { appId, code, phoneCredentialsCode, userTypes: getUserTypes(), clientId },
    'POST',
    { showLoading: false },
  );
};

/**
 * 账号登录
 * @param accountName
 * @param password
 */
export const accountLogin = (account: string, password: string, clientId: string) => {
  let appId;
  // #ifdef MP-WEIXIN
  appId = uni.getAccountInfoSync().miniProgram.appId;
  // #endif
  return request(
    '/anon/mobile/loginByAccount',
    {
      account,
      password,
      userTypes: getUserTypes(),
      clientId,
      appId,
    },
    'POST',
    {
      showLoading: false,
    },
  );
};

/**
 * 手机号登录
 * @param phoneNumber
 * @param captcha
 */
export const verificationCode = (
  phoneNumber: number | string,
  captcha: string,
  clientId: string,
) => {
  let appId;
  // #ifdef MP-WEIXIN
  appId = uni.getAccountInfoSync().miniProgram.appId;
  // #endif
  return request(
    '/anon/mobile/loginByPhone',
    {
      phoneNumber,
      captcha,
      userTypes: getUserTypes(),
      clientId,
      appId,
    },
    'POST',
    {
      showLoading: false,
    },
  );
};

/**
 * 获取短信验证码
 * @param phoneNumber
 * @param debug
 */
export const requestSms = (phoneNumber: string, checkAccountFlag = true, debug = 0) => {
  return request(
    '/anon/mobile/captcha',
    {
      phoneNumber,
      checkAccountFlag,
      debug,
    },
    'GET',
    {
      contentType_form: true,
      defaultError: false,
      showLoading: false,
    },
  );
};

/**
 * 重置密码-手机号验证
 * @param phoneNumber
 * @param captcha
 */
export const verifyPhoneNumber = (phoneNumber: string, captcha: string) => {
  return request('/anon/mobile/verify/phoneNumber', { phoneNumber, captcha }, 'POST', {});
};

/**
 * 重置密码-密码修改
 * @param phoneNumber
 * @param captcha
 */
export const resetPwd = (phoneNumber: string, password: string, code: string, account: string) => {
  return request(
    '/anon/mobile/reset/password/byUpdateCode',
    { phoneNumber, password, code, account },
    'POST',
    {},
  );
};

/**
 * 重置默认密码
 * @param phoneNumber
 * @param captcha
 */
export const resetDefaultPwd = (
  phoneNumber: string,
  password: string,
  captcha: string,
  account: string,
) => {
  return request(
    '/anon/mobile/resetPwd/byCaptcha',
    { phoneNumber, password, captcha, account },
    'POST',
    {},
  );
};

/**
 * 重置默认密码并绑定手机号
 * @param phoneNumber
 * @param captcha
 */
export const resetDefaultPwdAndBindMobile = (
  phoneNumber: string,
  password: string,
  captcha: string,
  account: string,
) => {
  return request(
    '/anon/mobile/resetPwdBindMobile/byCaptcha',
    { phoneNumber, password, captcha, account },
    'POST',
    {},
    captcha,
  );
};

/**
 * 退出登录
 * @param phoneNumber
 * @param captcha
 */
export const logoutApi = (appClientId: string, cid: string) => {
  return request(`/mobile/logout?appClientId=${appClientId}&cid=${cid}`, {}, 'GET', {
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 账号注销
 * @param phoneNumber
 * @param captcha
 */
export const cancelAccountApi = () => {
  return request('/user/cancel', {}, 'DELETE', {
    defaultError: true,
    showLoading: true,
  });
};

/**
 * 绑定手机号
 * @param phoneNumber
 * @param captcha
 */
export const bindMobile = (phoneNumber: string, captcha: string, account: string) => {
  return request('/anon/mobile/bindMobile/byCaptcha', { phoneNumber, captcha, account }, 'POST', {
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 查询是否绑定手机号
 * @param phoneNumber
 * @param captcha
 */
export const isBindMobile = (platformType: PlatformType, authCode: string, clientId: string) => {
  return request(`/anon/mobile/isBindThirdVendor/${platformType}`, { authCode, clientId }, 'POST', {
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 第三方登录
 * @param phoneNumber
 * @param captcha
 */
export const thirdLogin = (platformType: PlatformType, thirdUnionId: string, clientId: string) => {
  return request(
    `/anon/mobile/loginByThirdVendor/${platformType}`,
    { thirdUnionId, userTypes: getUserTypes(), clientId },
    'POST',
    {
      defaultError: false,
      showLoading: false,
    },
  );
};

/**
 * 第三方凭证绑定并登录
 * @param phoneNumber
 * @param captcha
 */
export const thirdBindAndLogin = (
  platformType: PlatformType,
  thirdUnionId: string,
  phoneNumber: number | string,
  captcha: string,
  clientId: string,
) => {
  return request(
    `/anon/mobile/bindAndLoginByThirdVendor/${platformType}`,
    { thirdUnionId, userTypes: getUserTypes(), phoneNumber, captcha, clientId },
    'POST',
    {
      defaultError: false,
      showLoading: false,
    },
  );
};

/**
 * 运营商登录
 * @param phoneNumber
 * @param captcha
 */
export const operatorLogin = (mobileTicket: string, clientId: string) => {
  return request(
    `/anon/mobile/loginByMobileTicket`,
    { mobileTicket, userTypes: getUserTypes(), clientId },
    'POST',
    {
      defaultError: false,
      showLoading: false,
    },
  );
};
