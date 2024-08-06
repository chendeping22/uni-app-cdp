import { accountLogin, thirdBindAndLogin } from '@/app-platform/services/login';
import { getAppClientId } from '@/app-platform/utils/tools';
import { loginStore, type IOrganizationList } from '@/store/modules/login';
import { isNil } from '@/utils/lodash-es';
import { showInfo } from '@/utils/tools';
import SparkMD5 from 'spark-md5';
import { PlatformType } from './index';

// 手机号登陆
export const defaultLoginAction = async (accountValue: string, newPwdValue: string) => {
  try {
    const [clientId] = await getAppClientId();
    const organizationList = (await accountLogin(
      accountValue,
      SparkMD5.hash(newPwdValue),
      clientId,
    )) as IOrganizationList;
    // 产品要加这个逻辑 没办法
    return await selectIdentity(organizationList);
  } catch (error) {
    return Promise.reject(error);
  }
};

// 第三方登陆
export const thirdLoginAction = async (
  platformType: PlatformType,
  thirdUnionId: string,
  phoneNumber: string,
  captcha: string,
) => {
  try {
    const [clientId] = await getAppClientId();
    const organizationList = (await thirdBindAndLogin(
      platformType,
      thirdUnionId,
      phoneNumber,
      captcha,
      clientId,
    )) as IOrganizationList;
    // 产品要加这个逻辑 没办法
    return await selectIdentity(organizationList);
  } catch (error) {
    return Promise.reject(error);
  }
};

// 选择组织
const selectIdentity = async (organizationList: IOrganizationList) => {
  const store = loginStore();
  const { updateOrganizationList } = store;
  updateOrganizationList(organizationList as IOrganizationList);

  if (
    organizationList.locations.length == 1 &&
    organizationList.locations[0].locations.length == 1 &&
    (isNil(organizationList.locations[0].locations[0].children) ||
      organizationList.locations[0].locations[0].children?.length < 1)
  ) {
    const identity = await store.changeIdentity(
      organizationList.locations[0].userType,
      organizationList.locations[0].locations[0],
    );
    console.log('切换成功', identity);
    uni.reLaunch({
      url: `/pages/workbench/index`,
      success: () => {},
      fail: err => {
        showInfo('登陆失败');
      },
    });
  } else {
    uni.redirectTo({
      url: '/app-platform/login/switch-identity',
    });
  }

  return true;
};
