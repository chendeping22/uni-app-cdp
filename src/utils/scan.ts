import { meetingSignIn } from '@/services/scan';
import { EApplicationType, ETargetType, IApplication } from '@/store/modules/workbench';
import { request } from '@/utils/request';
import useIsSchool from '@/utils/use-is-school';
import useIsTeacher from '@/utils/use-is-teacher';
import { goToApplication } from './go-to-application';
import { goToWebView } from './go-to-webview';
import { EOpenSourceType, handleLink } from './handle-share-link';
import { showInfo } from './tools';

/**
 * 扫描code类型
 */
export enum ScanCodeType {
  /**
   * 移动端工作台 / 会议管理
   */
  MeetingSign = 'MeetingSign',
  /**
   * 旧的巡更 ---王开利
   */
  PatrolPoint = 'patrol_point',
  /**
   * 旧的互动课堂  ---高雷鸣
   */
  InteractiveClassroom = 'interactive_classroom',
  /**
   * 班牌：会议模式 ---吕剑超
   */
  ClassScreenMeeting = 'ClassScreen:meeting:Mobile',
  /**
   * 消杀管理：人工消杀计划  ---曾立群
   */
  DisinfectionArtificialityPlan = 'Disinfection:Artificiality:Plan',
  /**
   * 巡更管理：基础设置/巡更点 ---王开利
   */
  PatrolBasicSettingsPoint = 'Patrol:Basic:Settings:Point',
  /**
   * 审批中心 --- 林臻
   */
  WorkOrderCreateDf = 'workOrder:create:df',
  /**
   * 资产管理
   */
  Assets = 'assets',
}

interface IScanResult {
  code: ScanCodeType;
  [k: string]: any;
}

type ScanCodeMap = {
  [k in ScanCodeType]: (res: IScanResult) => any;
};

const scanCodeMap: ScanCodeMap = {
  [ScanCodeType.MeetingSign](res: IScanResult) {
    const address = res.appDomain;
    const pathName = `${address}/pages/meeting/meetingManage/scanMeeting?params=${JSON.stringify(
      res,
    )}`;
    goToWebView(ETargetType.TargetTypeAbsoluteH5, pathName);
  },
  [ScanCodeType.PatrolPoint](res: IScanResult) {
    const { id, code, locationId } = res;
    goToWebView(
      ETargetType.TargetTypeRelativeH5AtImp,
      `/patrol-management/check-list?scanCodeId=${id}&qrCode=${code}&locationId=${locationId}`,
      EApplicationType.Old,
    );
  },
  [ScanCodeType.InteractiveClassroom](res: IScanResult) {
    if (useIsTeacher() && useIsSchool()) {
      const url = `/interactive/pages/interactive-classroom/index?scanCodeId=${res?.uuid}`;
      goToWebView(ETargetType.TargetTypeRelativeH5AtImp, url, EApplicationType.Old);
    } else {
      showInfo('请使用校级账号进行扫码！');
    }
  },
  [ScanCodeType.ClassScreenMeeting](res: IScanResult) {
    const { bizId } = res;
    if (!bizId) {
      showInfo('无效的二维码！');
      return;
    }
    meetingSignIn(bizId)
      .then((res: any) => {
        if (res === null) {
          showInfo('已签到');
        }
      })
      .catch((err: any) => {
        console.log('扫码失败', err);
        showInfo(err.desc || '扫码失败');
      });
  },
  [ScanCodeType.DisinfectionArtificialityPlan](res: IScanResult) {
    //TODO
    console.error('待产品线迁移....', JSON.stringify(res));
  },
  [ScanCodeType.PatrolBasicSettingsPoint](res: IScanResult) {
    const { id, bizId, bizParam } = res;
    // #ifdef APP-PLUS
    const path = '/patrol-management/check-list';
    let pagePath = undefined;
    if (bizId) {
      if (bizParam?.type === 2) {
        pagePath = `${path}?scanCodeId=${bizId}`;
      } else {
        pagePath = `${path}?scanCodeId=${id}&qrCode=${bizId}&locationId=${bizParam?.locationId}`;
      }
      goToWebView(ETargetType.TargetTypeRelativeH5AtImp, pagePath, EApplicationType.Old);
      return;
    }

    showInfo('无效的二维码！');
    // #endif
    return;
  },
  [ScanCodeType.WorkOrderCreateDf](res: IScanResult) {
    const { processType, defaultFormValues } = res;

    request(`/v1/process/getProcessExtDefByType/${processType}`, {}, 'GET', {
      spaceType: request.service.flow,
    }).then((process: any) => {
      const { name, locationId, processKey } = process;
      const flowObj = {
        text: name,
        locationId,
        processKey,
        processType,
        orderType: 'new',
      };
      let defaultFormValuesStr = '';
      if (defaultFormValues) {
        defaultFormValuesStr += `&defaultFormValues=${JSON.stringify(defaultFormValues)}`;
      }

      goToWebView(
        ETargetType.TargetTypeRelativeH5AtImp,
        `/subPackages/work-order/create/index?param=${JSON.stringify(
          flowObj,
        )}${defaultFormValuesStr}`,
        EApplicationType.Old,
      );
    });
  },
  [ScanCodeType.Assets](res: IScanResult) {
    // 资产管理
    const { bizId } = res;
    goToWebView(
      ETargetType.TargetTypeNative,
      `/app-school-affairs/assets-manage/pages/detail/index?id=${bizId}`,
    );
  },
};

export const scanHandle = (options?: ScanCodeOptions) => {
  uni.scanCode({
    ...{ scanType: ['qrCode'], ...options },
    success: function (res) {
      if (res.result) {
        try {
          qrCodeJump(res.result);
        } catch (e) {
          // 兼容url带参数的
          try {
            if (isValidURL(res.result)) {
              qrCodeJump(paramsString(res.result));
            } else {
              showInfo('无效的二维码！');
            }
          } catch (e) {
            showInfo('无效的二维码！');
          }
        }
      } else {
        showInfo('无效的二维码！');
      }
    },
  });
};

export const qrCodeJump = (res: string) => {
  if (typeof res !== 'string') {
    showInfo('无效的二维码！');
    return;
  }
  console.log('🚀🚀🚀🚀🚀🚀🚀 ~ qrCodeJump ~ data:' + JSON.stringify(res));

  const result: IScanResult = JSON.parse(res);

  if (!result || typeof result !== 'object') {
    showInfo('无效的二维码！');
    return;
  }

  result.code = result.code || result.action || result.type;
  if (!result.code) {
    goToNewHandleAction(result);
    return;
  }

  if (!Object.keys(scanCodeMap).includes(result.code)) {
    goToNewHandleAction(result);
    return;
  }

  return scanCodeMap[result.code](result);
};

// 注意：新增加的业务扫码用这个新的规则
const goToNewHandleAction = (result: IScanResult) => {
  if (result.path && result.path.length > 0) {
    if (result.appCode && result.appCode.length > 0 && result.uType && result.uType.length > 0) {
      const params = {
        R: encodeURIComponent(decodeURIComponent(result.path)),
        A: result.appCode,
        U: result.uType,
      };
      handleLink(params, { source: EOpenSourceType.scan });
    } else if (result.target && result.target > 0) {
      const item: IApplication = {
        code: '',
        icon: '',
        id: '',
        name: result.name ? result.name : '',
        path: result.path,
        target: result.target,
        type: result.type > 0 ? result.type : EApplicationType.New,
      };
      goToApplication(item);
    } else {
      showInfo('无效的二维码！');
    }
  } else {
    showInfo('无效的二维码！');
  }
};

export const paramsString = (url: string) => {
  const urlParams = url?.split('?')?.[1];
  const params: { [key: string]: any } = {};
  urlParams.split('&').forEach(item => {
    const [k, v] = item.split('=');
    params[k] = v;
  });

  return JSON.stringify(params);
};

function isValidURL(url) {
  const regex = /^(https?:\/\/)/;
  return regex.test(url);
}
