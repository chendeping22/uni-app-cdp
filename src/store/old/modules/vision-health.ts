import { StoreOptions } from 'vuex';

const initialState: any = {
  userInfo: null, // 用户信息
  studentInfo: null, // 学生信息
  checkWork: null, // 检查工作信息
  checkType: '0', // 0 视力 1 屈光
  checkName: null, // 0 视力 1 屈光
  bluetoothInfo: null, // 蓝牙设备信息
  deviceServices: null, // 设备服务
  navBarStyle: {}, // 状态栏导航信息,
  screenType: '2', //(1按组织、2按学生）
  classicBluetoothInfo: {
    isConnect: false,
    deviceId: '',
    name: '',
    type: '',
  },
  IVisionTestData: {
    left: '',
    right: '',
  },
  doctorType_aws: null, // 医生模式
  isDaily: false, // 是否是日常检测
};

const mutations: any = {
  UPDATE_USERINFO(state: { userInfo: any }, data: any) {
    state.userInfo = data;
  },
  UPDATE_STUINFO(state: { studentInfo: any }, data: any) {
    state.studentInfo = data;
  },
  UPDATE_WORKINFO(state: { checkWork: any }, data: any) {
    state.checkWork = data;
  },
  UPDATE_CHECKTYPE(state: { checkType: any }, data: any) {
    state.checkType = data;
  },
  UPDATE_CHECKNAME(state: { checkName: any }, data: any) {
    state.checkName = data;
  },
  UPDATE_SCREENTYPE(state: { screenType: any }, data: any) {
    state.screenType = data;
  },
  UPDATE_BLUEINFO(state: { bluetoothInfo: any }, data: any) {
    state.bluetoothInfo = data;
  },
  UPDATE_DEVICE_SERVE(state: { deviceServices: any }, data: any) {
    state.deviceServices = data;
  },
  UPDATE_NAVBAR(state: { navBarStyle: any }, data: any) {
    state.navBarStyle = data;
  },
  UPDATE_CLASSIC_BLUETOOTH_INFO(state: { classicBluetoothInfo: any }, data: any) {
    state.classicBluetoothInfo = data;
  },
  UPDATE_IVISION_DATA(state: { IVisionTestData: any }, data: any) {
    state.IVisionTestData = data;
  },
  UPDATE_DOCTORTYPR_AWS(state: { doctorType_aws: any }, data: any) {
    state.doctorType_aws = data;
  },
  /** 更新是否为日常检测 */
  UPDATE_IS_DAILY(state: { isDaily: boolean }, isDaily: boolean) {
    state.isDaily = isDaily;
  },
};
const actions: any = {
  changeUserInfo({ commit }: any, data: any) {
    commit('UPDATE_USERINFO', data);
  },
  changeStudentInfo({ commit }: any, data: any) {
    commit('UPDATE_STUINFO', data);
  },
  changeWorkInfo({ commit }: any, data: any) {
    commit('UPDATE_WORKINFO', data);
  },
  changeCheckType({ commit }: any, data: any) {
    commit('UPDATE_CHECKTYPE', data);
  },
  changeCheckName({ commit }: any, data: any) {
    commit('UPDATE_CHECKNAME', data);
  },
  changeScreenType({ commit }: any, data: any) {
    commit('UPDATE_SCREENTYPE', data);
  },
  changeBluetoothInfo({ commit }: any, data: any) {
    commit('UPDATE_BLUEINFO', data);
  },
  changeDeviceServices({ commit }: any, data: any) {
    commit('UPDATE_DEVICE_SERVE', data);
  },
  setNavBarStyle({ commit }: any, data: any) {
    commit('UPDATE_NAVBAR', data);
  },
  changeClassicBluetoothInfo({ commit }: any, data: any) {
    commit('UPDATE_CLASSIC_BLUETOOTH_INFO', data);
  },
  changeIVisionData({ commit }: any, data: any) {
    commit('UPDATE_IVISION_DATA', data);
  },
};
const getters: any = {
  userInfo: (state: { userInfo: any }) => state.userInfo,
  studentInfo: (state: { studentInfo: any }) => state.studentInfo,
  checkWork: (state: { checkWork: any }) => state.checkWork,
  checkType: (state: { checkType: any }) => state.checkType,
  checkName: (state: { checkName: any }) => state.checkName,
  bluetoothInfo: (state: { bluetoothInfo: any }) => state.bluetoothInfo,
  deviceServices: (state: { deviceServices: any }) => state.deviceServices,
  navBarStyle: (state: { navBarStyle: any }) => state.navBarStyle,
  screenType: (state: { screenType: any }) => state.screenType,
  classicBluetoothInfo: (state: { classicBluetoothInfo: any }) => state.classicBluetoothInfo,
  IVisionTestData: (state: { IVisionTestData: any }) => state.IVisionTestData,
  doctorType_aws: (state: { doctorType_aws: any }) => state.doctorType_aws,
  isDaily: (state: { isDaily: boolean }) => state.isDaily,
};
export default {
  state: () => initialState,
  mutations,
  actions,
  getters,
} as StoreOptions<any>;
