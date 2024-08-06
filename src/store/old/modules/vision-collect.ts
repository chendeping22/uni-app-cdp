import { StoreOptions } from 'vuex';

const initialState: any = {
  // userInfo: null, // 用户信息
  // studentInfo: null, // 学生信息
  // checkWork: null, // 检查工作信息
  // checkType: '0', // 0 视力 1 屈光
  // checkName: null, // 0 视力 1 屈光
  // bluetoothInfo: null, // 蓝牙设备信息
  // deviceServices: null, // 设备服务
  // navBarStyle: {}, // 状态栏导航信息,
  // screenType: '2', //(1按组织、2按学生）
  // classicBluetoothInfo: {
  //   isConnect: false,
  //   deviceId: '',
  //   name: '',
  //   type: '',
  // },
  // IVisionTestData: {
  //   left: '',
  //   right: '',
  // },
  doctorType: null, // 医生模式
  checkWork_vc: null, // 检查工作信息
  studentInfo_vc: null, // 学生信息
  bluetoothInfo_vc: null, // 蓝牙设备信息
  classicBluetoothInfo_vc: {
    isConnect: false,
    deviceId: '',
    name: '',
    type: '',
  },
  IVisionTestData_vc: {
    left: '',
    right: '',
  },
};

const mutations: any = {
  // UPDATE_USERINFO(state: { userInfo: any }, data: any) {
  //   state.userInfo = data;
  // },
  // UPDATE_STUINFO(state: { studentInfo: any }, data: any) {
  //   state.studentInfo = data;
  // },
  // UPDATE_WORKINFO(state: { checkWork: any }, data: any) {
  //   state.checkWork = data;
  // },
  // UPDATE_CHECKTYPE(state: { checkType: any }, data: any) {
  //   state.checkType = data;
  // },
  // UPDATE_CHECKNAME(state: { checkName: any }, data: any) {
  //   state.checkName = data;
  // },
  // UPDATE_SCREENTYPE(state: { screenType: any }, data: any) {
  //   state.screenType = data;
  // },
  // UPDATE_BLUEINFO(state: { bluetoothInfo: any }, data: any) {
  //   state.bluetoothInfo = data;
  // },
  // UPDATE_DEVICE_SERVE(state: { deviceServices: any }, data: any) {
  //   state.deviceServices = data;
  // },
  // UPDATE_NAVBAR(state: { navBarStyle: any }, data: any) {
  //   state.navBarStyle = data;
  // },

  // UPDATE_IVISION_DATA(state: { IVisionTestData: any }, data: any) {
  //   state.IVisionTestData = data;
  // },
  UPDATE_WORKINFO_VC(state: { checkWork_vc: any }, data: any) {
    state.checkWork_vc = data;
  },
  UPDATE_STUINFO_VC(state: { studentInfo_vc: any }, data: any) {
    state.studentInfo_vc = data;
  },
  UPDATE_BLUEINFO_VC(state: { bluetoothInfo_vc: any }, data: any) {
    state.bluetoothInfo_vc = data;
  },
  UPDATE_CLASSIC_BLUETOOTH_INFO_VC(state: { classicBluetoothInfo_vc: any }, data: any) {
    state.classicBluetoothInfo_vc = data;
  },
  UPDATE_IVISION_DATA_VC(state: { IVisionTestData_vc: any }, data: any) {
    state.IVisionTestData_vc = data;
  },
  UPDATE_DOCTORTYPR(state: { doctorType: any }, data: any) {
    state.doctorType = data;
  },
};
const actions: any = {
  // changeUserInfo({ commit }: any, data: any) {
  //   commit('UPDATE_USERINFO', data);
  // },
  // changeStudentInfo({ commit }: any, data: any) {
  //   commit('UPDATE_STUINFO', data);
  // },
  // changeWorkInfo({ commit }: any, data: any) {
  //   commit('UPDATE_WORKINFO', data);
  // },
  // changeCheckType({ commit }: any, data: any) {
  //   commit('UPDATE_CHECKTYPE', data);
  // },
  // changeCheckName({ commit }: any, data: any) {
  //   commit('UPDATE_CHECKNAME', data);
  // },
  // changeScreenType({ commit }: any, data: any) {
  //   commit('UPDATE_SCREENTYPE', data);
  // },
  // changeBluetoothInfo({ commit }: any, data: any) {
  //   commit('UPDATE_BLUEINFO', data);
  // },
  // changeDeviceServices({ commit }: any, data: any) {
  //   commit('UPDATE_DEVICE_SERVE', data);
  // },
  // setNavBarStyle({ commit }: any, data: any) {
  //   commit('UPDATE_NAVBAR', data);
  // },
  // changeClassicBluetoothInfo({ commit }: any, data: any) {
  //   commit('UPDATE_CLASSIC_BLUETOOTH_INFO', data);
  // },
  // changeIVisionData({ commit }: any, data: any) {
  //   commit('UPDATE_IVISION_DATA', data);
  // },
  changeWorkInfo({ commit }: any, data: any) {
    commit('UPDATE_WORKINFO_VC', data);
  },
  changeBluetoothInfo_vc({ commit }: any, data: any) {
    commit('UPDATE_BLUEINFO_VC', data);
  },
  changeClassicBluetoothInfo_vc({ commit }: any, data: any) {
    commit('UPDATE_CLASSIC_BLUETOOTH_INFO_VC', data);
  },
};
const getters: any = {
  // userInfo: (state: { userInfo: any }) => state.userInfo,
  // studentInfo: (state: { studentInfo: any }) => state.studentInfo,
  // checkWork: (state: { checkWork: any }) => state.checkWork,
  // checkType: (state: { checkType: any }) => state.checkType,
  // checkName: (state: { checkName: any }) => state.checkName,
  // bluetoothInfo: (state: { bluetoothInfo: any }) => state.bluetoothInfo,
  // deviceServices: (state: { deviceServices: any }) => state.deviceServices,
  // navBarStyle: (state: { navBarStyle: any }) => state.navBarStyle,
  // screenType: (state: { screenType: any }) => state.screenType,
  // classicBluetoothInfo: (state: { classicBluetoothInfo: any }) => state.classicBluetoothInfo,
  // IVisionTestData: (state: { IVisionTestData: any }) => state.IVisionTestData,
  checkWork_vc: (state: { checkWork_vc: any }) => state.checkWork_vc,
  studentInfo_vc: (state: { studentInfo_vc: any }) => state.studentInfo_vc,
  bluetoothInfo_vc: (state: { bluetoothInfo_vc: any }) => state.bluetoothInfo_vc,
  classicBluetoothInfo_vc: (state: { classicBluetoothInfo_vc: any }) =>
    state.classicBluetoothInfo_vc,
  IVisionTestData_vc: (state: { IVisionTestData_vc: any }) => state.IVisionTestData_vc,
  doctorType: (state: { doctorType: any }) => state.doctorType,
};
export default {
  state: () => initialState,
  mutations,
  actions,
  getters,
} as StoreOptions<any>;
