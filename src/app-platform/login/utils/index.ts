export const getLoginBannerList = () => {
  return [
    {
      imageSrc: 'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/banner_5.png',
      title: '在校生活、高效管理',
      content: '辅助老师进行教务工作，家长全面了解在校活动，保障孩子在校安全',
    },
    {
      imageSrc: 'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/banner_6.png',
      title: '线上办理、便捷操作',
      content: '线上快捷完成行政办公、日常记录类任务，助力老师、学生高效协作',
    },
    {
      imageSrc: 'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/banner_7.png',
      title: '习惯养成，助力提升',
      content: '辅助孩子校外习惯养成，提供养成打卡，记录孩子的努力',
    },
    {
      imageSrc: 'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/banner_8.png',
      title: '设备物联、一键管理',
      content: '校内设备智能物联，运行状态一目了解，支持一键控制',
    },
  ];
};

export const getLoginTips = () => {
  return '仅为IMP平台用户提供服务';
};

/** 第三方登录平台类型 接口按这个值来 不能随便乱改 */
export enum PlatformType {
  WeChat = 'WeChat',
  DingTalk = 'DingTalk',
  Apple = 'Apple',
  Phone = 'Phone',
}

/** 点击登录类型 */
export enum ClickLoginType {
  none = 0,
  /** 账号密码登录 */
  account = 1,
  /** 手机号登录 */
  mobile = 2,
  /** 微信快捷登录 */
  weChat = 3,
  /** 钉钉快捷登录 */
  dingTalk = 4,
  /** 苹果快捷登录 */
  apple = 5,
  /** 运营商快捷登录 */
  phone = 6,
  /** 微信小程序快捷登录 */
  WechatMiniProgram = 7,
}
