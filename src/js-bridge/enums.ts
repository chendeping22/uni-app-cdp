/** 模块类型 */
export enum Service {
  file = 'file', //file
  wifi = 'wifi', //wifi
  udp = 'udp', //udp
  ble = 'ble', //ble
  face = 'face', //face
  system = 'system', //system
  live = 'live', //live
  permission = 'permission', //permission
  x5 = 'x5',
  auth = 'auth', //第三方授权登录
  player = 'player', // 播放器-支持h265

  errorPage = 'errorPage', // 错误页
  navigation = 'navigation', // 导航栏
  workbench = 'workbench', // 工作台

  BullyCall = 'BullyCall', // 防欺凌对讲
}

/** 功能类型 */
export enum Action {
  /** file */
  filePicker = 'picker',
  fileUpload = 'upload',
  fileDownloadAndOpen = 'downloadAndOpen',
  fileUploadByH5 = 'fileUploadByH5',
  fileUploadResult = 'fileUploadResult', // 在小程序里h5页面文件上传回调数据
  filePreview = 'filePreview', // 文件预览
  /** wifi */
  getConnectedWifi = 'getConnectedWifi',
  /** udp */
  sendAudio = 'send_audio',

  /** ble */
  bleSearch = 'search',
  bleConnect = 'connect',
  bleReConnect = 'reconnect',
  bleDisConnect = 'disconnect',
  blePublish = 'publish',
  /** face */
  openFaceDiscern = 'openFaceDiscern',
  onFaceRes = 'onFaceRes',
  closeFaceDiscern = 'closeFaceDiscern',
  /** system */
  showToast = 'showToast',
  showLoading = 'showLoading',
  hideLoading = 'hideLoading',
  commConfig = 'commConfig', // 通用配置
  scanCode = 'scanCode', //扫码
  share = 'share', // 分享
  screenOrientation = 'screenOrientation', //屏幕旋转
  sendMessage = 'sendMessage', //发送短信
  addContact = 'addContact', //新增联系人到通讯录
  updateContact = 'updateContact', //修改现有联系人到通讯录
  openSetting = 'openSetting', //打开app系统设置页

  /** live */
  openLive = 'openLive', //打开录播

  /** permission */
  requestAllChooseImagePermissions = 'requestAllChooseImagePermissions', // 请求所有uni.chooseImage所需的权限
  requestScanCodePermissions = 'requestScanCodePermissions', // 请求所有uni.scanCode所需的权限
  requestPhoneCallPermissions = 'requestPhoneCallPermissions', // 请求所有uni.makePhoneCall所需的权限

  /** x5 */
  checkX5Core = 'checkX5Core',
  openUseX5 = 'openUseX5',

  /** auth */
  appleAuth = 'apple',
  wechatAuth = 'weChat',
  dingTalkAuth = 'dingTalk',
  isInstalledWeChat = 'isInstalledWeChat', //苹果审核用 安卓没安装直接提示
  isSupportPhoneAuth = 'isSupportPhoneAuth', //是否支持手机一键登录
  presentOneKeyLoginView = 'presentOneKeyLoginView', //弹窗手机一键登录页面
  dismissOneKeyLoginView = 'dismissOneKeyLoginView', //关闭一键登录页面

  /**player */
  playerPlay = 'play',

  /** 关闭错误页 */
  errorPageClose = 'close',
  errorPageRefresh = 'refresh',
  /** 导航 */
  navigationBack = 'back', //拦截返回
  navigationSetRightButtons = 'setRightButtons', //设置右边按钮
  /** 工作台 */
  widgetRefresh = 'widgetRefresh', //小组件刷新

  /** 防欺凌对讲功能 */
  bullyRegisterListener = 'registerListener', // 事件上报回调
  bullyCallInit = 'init', // 初始化
  bullyCallLogin = 'login', // 对讲登录
  bullyCallStartTalk = 'startTalk', // 开始对讲
  bullyCallStopTalk = 'stopTalk', // 停止对讲
  bullyCallDestroy = 'destroy', // 销毁对讲
  bullyCallGetSelfDeviceId = 'getSelfDeviceId', // 获取设备id
}
