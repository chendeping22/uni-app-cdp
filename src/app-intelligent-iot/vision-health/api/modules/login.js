import { request } from '@/utils/request';

export default {
  // 发送验证码
  sendCode(params) {
    return request('/rest/ma/screenUser/sendCode', params, 'GET');
  },
  // 登陆
  login(params) {
    return request('/rest/ma/screenUser/login', params, 'POST');
  },
  // 获取人员信息
  getUser(params) {
    return request('/rest/ma/screenUser/getUser', params, 'GET');
  },
  // code登陆
  codeLogin(params) {
    return request('/rest/ma/login/codeLogin', params, 'POST');
  },
  // 家长端登录
  personCodeLogin(params) {
    return request('/rest/ma/login/personCodeLogin', params, 'POST');
  },
  /** 登记公众号 */
  registerOfficialAccount(params) {
    return request('/rest/ma/screenUser/getUnionId', params, 'POST');
  },
};
