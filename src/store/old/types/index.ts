/**
 * commit和dispatch名称都在此声明: 命名空间+函数名称
 */

export enum ENV_COMMITS {
  setRunEnv = 'env/setRunEnv',
  setAuthInfo = 'env/setAuthInfo',
  setClientId = 'env/setClientId',
  setOnline = 'env/setOnline',
  setCode = 'env/setCode',
  setEnv = 'env/setEnv',
  setEnvType = 'env/setEnvType',
  setAppPermissions = 'env/setAppPermissions',
  //   setIsActive = "env/setIsActive",
  //   setPermission = "env/setPermission",
  setSpace = 'env/setSpace',
  setSpaceBreads = 'env/setSpaceBreads',
  setPermissionSpace = 'env/setPermissionSpace',
  setPermissionSpaceBreads = 'env/setPermissionSpaceBreads',
  setUserInfo = 'env/setUserInfo',
}

export enum INKFISH_COMMITS {
  setNotification = 'inkfish/setNotification', // BOSS平台发布的通知
  dismissNotification = 'inkfish/dismissNotification',
}

export enum SYSTEM_COMMITS {
  setNavBarHeight = 'system/setNavBarHeight',
  setTabBarHeight = 'system/setTabBarHeight',
  setMiniProgram = 'system/setMiniProgram', // 其它小程序跳转传入的参数
  setFollowGuideOpened = 'system/setFollowGuideOpened', // 公众号关注引导页是否已打开, 进程级别
}

export enum DATA_COMMITS {
  setTeachingInfo = 'data/setTeachingInfo', //  教师任教科目/班级
  setPushParams = 'data/setPushParams', // 点击推送参数
  setUnreadNum = 'data/setUnreadNum', // 设置消息未读数
  setPushAlarmMsgList = 'data/setPushAlarmMsgList', // 未处理的报警消息列表
  setQrCodeResult = 'data/setQrCodeResult', // 扫码结果内容
  setFrequentList = 'data/setFrequentList',
  setSchemaJumpParams = 'data/setSchemaJumpParams', // schema唤醒APP跳转参数
}

export enum MONITORING_COMMITS {
  setIPC = 'monitoring/setIPC', //  ipc树
}

export enum CLOCK_IN_COMMITS {
  setFormData = 'clock-in/setFormData', // 发布对象
  setSelectedClass = 'clock-in/setSelectedClass', // 选择的班级
}

export enum WORK_ORDER_COMMITS {
  setUserList = 'work-order/setUserList',
}

export enum MQTT_COMMITS {
  setData = 'mqtt/setData',
}

export enum PAGE_COMMITS {
  setPageLoadingStatus = 'page/setPageLoadingStatus',
}

export enum DAILY_HEALTH {
  setdailyHealthStudents = 'health/setdailyHealthStudents', // 每日健康, 设置学生(学生量大，故做缓存)
}

export enum SAFETY_EDUCATION {
  setClazzInfo = 'safetyEducation/setClazzInfo',
  clearClazzInfo = 'safetyEducation/clearClazzInfo',
}

export enum SPORTS_CLOCKIN {
  saveBluetoothDeviceInfo = 'sportsClockin/savebluetoothDeviceInfo',
  clearBluetoothDeviceInfo = 'sportsClockin/clearBluetoothDeviceInfo',
  saveSportsResult = 'sportsClockin/saveSportsResult',
  removeSportsResult = 'sportsClockin/removeSportsResult',
}

export enum Disease_Management {
  saveSymptomInfo = 'diseaseManagement/saveSymptomInfo',
  clearSymptomInfo = 'diseaseManagement/clearSymptomInfo',
}
