import { request } from '@/utils/request';

/**
 * 发送验证码
 * @param data captcha 验证码
 * @returns
 */

const prefix = '/payslipPasswords/';

export function sendCaptcha(data?: { captcha: string }) {
  // return Http.getInstance().post(`${apiPrefix}/payslipPasswords/sendCaptcha`, data);
  return request(prefix + 'sendCaptcha', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

/** 是否有密码 */
export function hasPasswordRequest() {
  // return Http.getInstance().post(`${apiPrefix}/payslipPasswords/hasPassword`);
  return request(prefix + 'hasPassword', {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

/** 校验密码 */
export function validPasswordRequest(data: { password: string }) {
  // return Http.getInstance().post(`${apiPrefix}/payslipPasswords/validPassword`, data);
  return request(prefix + 'validPassword', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
    // defaultError: false,
  });
}

/** 更新密码 */
export function updatePasswordRequest(data: { captcha: string; password: string }) {
  // return Http.getInstance().post(`${apiPrefix}/payslipPasswords/updatePassword`, data);
  return request(prefix + 'updatePassword', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
    // defaultError: false,
  });
}

/** 修改密码 */
export function modifyPasswordRequest(data: { originalPassword: string; password: string }) {
  // return Http.getInstance().post(`${apiPrefix}/payslipPasswords/modify`, data);
  return request(prefix + 'modify', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
    // defaultError: false,
  });
}
/** 获取是否开启密码的配置 */
export function getPsConfig() {
  return request('/payslipConfigs/getByLocation', {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}
