/** 微信分享的数据类型 */
export interface IOnShareAppMessage<T extends 'button' | 'menu'> {
  from: T;
  target: T extends 'menu'
    ? undefined
    : {
        dataset: {
          msg: any;
        };
      };
}

/**
 * 授权信息，当前仅微信端使用
 * 手机号登录仅有loginMode,appClientId
 * 微信授权, 无appClientId属性, 其它都有
 */
export interface ILoginStore {
  appId: string;
  clientId: string; // 仅手机号登录有值
}
