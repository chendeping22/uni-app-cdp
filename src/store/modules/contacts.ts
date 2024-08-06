import {
  IGetClazzListRtn,
  IStudentResps,
  IUserAuthInfo,
  getClazzList,
  getUserAuthInfoVo,
  getclazzFile,
} from '@/services/contact';
import { updateContactInfoCache } from '@/utils/cache-app';
import { hasNetwork, hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface IStuContactForStore {
  id: string;
  stuList: IStudentResps[];
}

export const contactStore = defineStore('contactStore', () => {
  // 班级列表数据
  const clazzList = ref([] as IGetClazzListRtn[]);
  const stuContactForStore = ref([] as IStuContactForStore[]);

  // 当前人员权限
  const userAuthInfo = ref({} as IUserAuthInfo);
  const isSwitchOrg = ref(false);

  const updateSwitchOrg = (switchOrg: boolean) => {
    isSwitchOrg.value = switchOrg;
  };

  const getUserAuthInfo = async () => {
    const res = await getUserAuthInfoVo();
    userAuthInfo.value = res;
    log('userAuthInfo : ', userAuthInfo.value);
  };

  // 获取班级列表
  const getClazzListData = async () => {
    try {
      showLoading();
      await getUserAuthInfo();
      let res = await getClazzList(false);
      if (res && res.length > 0) {
        clazzList.value = res;
        // 更新到storage缓存
        updateContactInfoCache();
      } else {
        if (!isSwitchOrg.value) {
          res = clazzList.value;
          log('缓存中的通讯录班级列表数据: ', res);
        }
        isSwitchOrg.value = false;
      }
      hideLoading();
      return res;
    } catch (error) {
      hideLoading();
      log('缓存中的通讯录班级列表数据: ', clazzList.value);
      return clazzList.value;
    }
  };

  // 获取班级对应的学生列表
  const getStuListData = async (id: string) => {
    try {
      const res = await getclazzFile(id, false);
      log('getStuListData -> res : ', res);
      if (res.studentResps && res.studentResps.length > 0) {
        // 做一个人员数量限制（100条限制）
        if (res.studentResps.length > 100) {
          res.studentResps = res.studentResps.slice(0, 100);
        }
        const stuContactList = [];
        stuContactList.push({ id: id, stuList: res.studentResps });
        stuContactForStore.value = stuContactList;
        log('学生列表更新到storage缓存');
        // 更新到storage缓存
        updateContactInfoCache();
        log('学生列表更新到storage缓存成功');
        return res.studentResps;
      } else {
        const stuListData = stuContactForStore.value.find(item => item.id == id);
        log('缓存中的通讯录班学生列表数据: ', stuListData?.stuList);
        return stuListData?.stuList;
      }
    } catch (error) {
      const stuListData = stuContactForStore.value.find(item => item.id == id);
      log('缓存中的通讯录班学生列表数据: ', stuListData?.stuList);
      if (!stuListData?.stuList) {
        if (!(await hasNetwork())) {
          showInfo('当前无网络，请连接网络');
        }
      }
      return stuListData?.stuList;
    }
  };

  return {
    clazzList,
    stuContactForStore,
    userAuthInfo,
    getUserAuthInfo,
    getClazzListData,
    getStuListData,
    updateSwitchOrg,
  };
});
