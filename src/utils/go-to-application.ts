import { getThirdApplicationInfo, getWechatMiniProgramConfigInfo } from '@/services/workbench';
import { ETerminal } from '@/store/modules/env';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, type IApplication } from '@/store/modules/workbench';
import { getAppVersion, getConfig } from './global-config';
import { EUserType } from './kind';
import { defaultFailText } from './request';
import {
  getHost,
  getLowCodeH5Host,
  getTrainingHost,
  hideLoading,
  showInfo,
  showLoading,
} from './tools';
import track, { TrackEvent } from './track';
import useIsSchool from './use-is-school';
// #ifndef MP-WEIXIN
import semverSatisfies from 'semver/functions/satisfies';
// #endif

export enum EOpenFrom {
  FromMsg = 'fromMsg', // 打开来自消息
}

interface IOptions {
  /** 跳转来源 */
  openFrom?: string;
  reLaunch?: boolean;
  redirect?: boolean;
}

/**
 * 根据target打开方式，跳转到对应的页面
 * @param appliction 跳转条件
 */
export const goToApplicationWithOpenFrom = async (
  appliction: IApplication,
  options: IOptions = {},
) => {
  console.log('click', appliction);

  // #ifndef MP-WEIXIN
  if (appliction.code && !isApplicationEnable(appliction.code)) {
    uni.showToast({
      title: '若要使用该功能，需先将APP升级至新版本',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
    return false;
  }
  // #endif

  // 去除undefined值
  appliction.name = appliction.name ?? '';
  // webview页面名称(在微信小程序里云上课堂特殊处理)
  const store = loginStore();
  const webViewName =
    store.currentEnv.terminal === ETerminal.Wechat &&
    appliction.path.indexOf('/intelligent-recording/classroom-on-cloud/doraemon-h5/index') != -1
      ? 'auto-page-orientation'
      : 'index';
  // 配置第三方且不是打开小程序应用 需要获取跳转信息
  if (
    appliction.type === EApplicationType.Third &&
    appliction.target != ETargetType.TargetTypeOpenWechatMiniProgram
  ) {
    showLoading();
    try {
      const res = await getThirdApplicationInfo(appliction.id, store.currentOrganization?.id ?? '');
      appliction.path = res.finalPath;
      hideLoading();
    } catch (error) {
      hideLoading();
      showInfo(defaultFailText(error) ?? '获取第三方应用配置信息失败');
      return;
    }
  }

  let goto = uni.navigateTo;
  if (options.redirect) {
    goto = uni.redirectTo;
  } else if (options.reLaunch) {
    goto = uni.reLaunch;
  }

  const openFrom = options.openFrom || '';
  switch (appliction.target) {
    case ETargetType.TargetTypeNative:
      {
        goto({
          url: appliction.path,
          fail(result) {
            console.log('open false', result);
          },
        });
      }
      break;
    case ETargetType.TargetTypeAbsoluteH5:
      {
        const path = encodeURIComponent(JSON.stringify(appliction.path));
        goto({
          url: `/app-platform/webview/${webViewName}?path=${path}&openFrom=${openFrom}&title=${appliction.name}`,
          fail(result: any) {
            console.log(result);
          },
        });
      }
      break;
    case ETargetType.TargetTypeRelativeH5AtImp:
      {
        const targetPath = '/' + appliction.path.replace(/^\//, '');
        let host = getHost();
        let path: string;
        if (appliction.type === EApplicationType.Old) {
          const config = getConfig();
          if (loginStore().currentUserType === EUserType.teacher) {
            host = useIsSchool() ? config.imp2_h5_host : config.imp2_edu_h5_host;
          } else {
            host = config.imp2_stu_h5_host;
          }
          path = encodeURIComponent(
            JSON.stringify(
              `${host}/pages/auto-login?redirectUrl=${encodeURIComponent(targetPath)}`,
            ),
          );
        } else {
          path = encodeURIComponent(JSON.stringify(`${host}${targetPath}`));
        }
        console.log('TargetTypeRelativeH5AtImp host : ' + host);
        goto({
          url: `/app-platform/webview/${webViewName}?path=${path}&openFrom=${openFrom}&title=${appliction.name}`,
          fail(result: any) {
            console.log(result);
          },
        });
      }
      break;
    case ETargetType.TargetTypeRelativeH5AtLowCode:
      {
        const path = encodeURIComponent(
          JSON.stringify(
            getLowCodeH5Host() + (appliction.path.startsWith('/') ? '' : '/') + appliction.path,
          ),
        );
        goto({
          url: `/app-platform/webview/${webViewName}?path=${path}&openFrom=${openFrom}&title=${appliction.name}`,
          fail(result) {
            console.log(result);
          },
        });
      }
      break;
    case ETargetType.TargetTypeAllApplication:
      {
        console.log('click all', appliction.path);

        goto({
          url: appliction.path,
          fail(result) {
            console.log('open false', result);
          },
        });
      }
      break;
    case ETargetType.TargetTypeOpenWechatMiniProgram:
      {
        const userId = loginStore().userInfo?.userId ?? loginStore().userInfo?.personId ?? '';
        showLoading();
        getWechatMiniProgramConfigInfo(appliction.id, userId)
          .then((res: any) => {
            hideLoading();
            console.log('获取到的小程序信息', res);
            // #ifdef APP-PLUS
            //需调用plus.share.getServices获取微信分享服务对象
            plus.share.getServices(
              s => {
                let sweixin: any = {};
                for (let i = 0; i < s.length; i++) {
                  const share: any = s[i];
                  if (share.id === 'weixin') {
                    sweixin = share;
                  }
                }
                //小程序参数，必填
                const WeixinMiniProgramOptions = {
                  id: res.id,
                  path: res.path, //可指定打开的页面
                };
                sweixin
                  ? sweixin.launchMiniProgram(WeixinMiniProgramOptions)
                  : showInfo('当前环境不支持微信操作!');
              },
              function (e) {
                showInfo(defaultFailText(e.message) ?? '获取分享服务列表失败');
              },
            );
            // #endif
            // #ifdef MP-WEIXIN
            uni.navigateToMiniProgram({
              appId: res.appId,
              path: res.path,
              fail() {
                showInfo('打开应用失败');
              },
            });
            // #endif
          })
          .catch(err => {
            hideLoading();
            showInfo(defaultFailText(err) ?? '获取小程序配置信息失败');
          });
      }
      break;
    case ETargetType.TargetTypeRelativeH5AtTraining:
      {
        const targetPath = '/' + appliction.path.replace(/^\//, '');
        const host = getTrainingHost();
        const path: string = encodeURIComponent(JSON.stringify(`${host}${targetPath}`));

        goto({
          url: `/app-platform/webview/${webViewName}?path=${path}&openFrom=${openFrom}&title=${appliction.name}`,
          fail(result: any) {
            console.log(result);
          },
        });
      }
      break;
  }
  if (appliction.code) {
    track('pageview', { appCode: appliction.code as TrackEvent['code'] });
  }
};

export const goToApplication = (appliction: IApplication) => {
  goToApplicationWithOpenFrom(appliction);
};

export const goToApplicationFromMsg = (appliction: IApplication) => {
  appliction.target = appliction.target ?? ETargetType.TargetTypeRelativeH5AtImp;
  appliction.type = EApplicationType.Old;
  console.log('goToApplicationFromMsg' + JSON.stringify(appliction));
  goToApplicationWithOpenFrom(appliction, {
    openFrom: EOpenFrom.FromMsg,
  });
};

export const goToApplicationFromMsgUseReLaunch = (appliction: IApplication) => {
  appliction.target = appliction.target ?? ETargetType.TargetTypeRelativeH5AtImp;
  appliction.type = EApplicationType.Old;
  console.log('goToApplicationFromMsgUseReLaunch' + JSON.stringify(appliction));
  goToApplicationWithOpenFrom(appliction, {
    openFrom: EOpenFrom.FromMsg,
    reLaunch: true,
  });
};

export function isApplicationEnable(appCode: string) {
  if (appCode) {
    const appVersion = getAppVersion();
    if (appVersion && appVersion[appCode]) {
      return semverSatisfies(__INTERNAL_VERSION__, appVersion[appCode]);
    }
  }
  // 旧应用无版本控制默认可用
  return true;
}
