const CORAL_ENV = import.meta.env.VITE_SERVER_ENV;

// 内容类型
enum contentTypeEnum {
  IMAGE_TEXT, // 图文
  TEXT, // 纯文字
  IMAGE, // 纯图片
  MUSIC, // 音乐
  VIDEO, // 视频
  MINIPROGRAM, // 小程序
}

// 微信小程序运行环境
enum wxRuntimeEnvEnum {
  RELEASE = 0, // 正式版
  DEVELOP = 1, // 开发版
  TRIAL = 2, // 体验版
}

const envTypeMap: Record<string, 0 | 1 | 2> = {
  PROD: wxRuntimeEnvEnum.RELEASE,
  DEV: wxRuntimeEnvEnum.DEVELOP,
  TEST: wxRuntimeEnvEnum.TRIAL,
  TEST2: wxRuntimeEnvEnum.TRIAL,
  PRE: wxRuntimeEnvEnum.RELEASE,
  PRE2: wxRuntimeEnvEnum.TRIAL,
};

export type TShareMsg = {
  title: string; // 分享内容
  path: string; // 页面路径
  imageUrl: string; // 分享图片
};

/**
 * 分享小程序到微信聊天界面(暂仅支持APP)
 * @param params
 */
export const shareMiniProgramToWXSceneSession = (
  shareMsg: TShareMsg,
  success?: (res: any) => void,
  fail?: (err: any) => void,
) => {
  // #ifdef APP-PLUS
  // 检查是否安装了微信
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    fail({ code: 400, msg: '您的手机尚未安装微信' });
    return;
  }
  const envType = envTypeMap[CORAL_ENV];
  const appid = plus.runtime.appid;
  if (!appid) {
    fail({ code: 401, msg: '找不到appid' });
    return;
  }

  const opt: UniApp.ShareOptions = {
    provider: 'weixin',
    type: contentTypeEnum.MINIPROGRAM,
    title: shareMsg.title,
    imageUrl: shareMsg.imageUrl,
    scene: 'WXSceneSession',
    miniProgram: {
      id: import.meta.env.VITE_WX_ID,
      path: shareMsg.path,
      type: envType,
      webUrl: import.meta.env.VITE_WX_WEB_URL,
    },
    success(result) {
      console.log('🚀 ~ file: class-files.vue ~ line 215 ~ success ~ result', result);
      success(result);
    },
    fail(e) {
      console.log('🚀 ~ file: class-files.vue ~ line 218 ~ fail ~ e', e);
      fail({ code: 402, msg: e.errMsg });
    },
  };
  uni.share(opt);
  // #endif
};
