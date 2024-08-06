import { EApplicationType, ETargetType, IApplication } from '@/store/modules/workbench';
import { goToApplication } from '@/utils/go-to-application';
import useIsBureau from '@/utils/use-is-bureau';
import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const filePreview = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  if (options.data.fileId && options.data.fileId.length > 0) {
    const path = `/api/clouddisk/onlinepreview/${options.data.fileId}`;
    const item: IApplication = {
      code: useIsBureau() ? 'JDJYYP' : 'Education:Cloud:Disk',
      icon: '',
      id: '',
      name: '预览',
      path: path,
      target: ETargetType.TargetTypeRelativeH5AtImp,
      type: EApplicationType.New,
    };
    goToApplication(item);
    resolve({});
  } else {
    reject({
      code: 400,
      msg: '文件不存在',
    });
  }
};

export default {
  filePreview,
};
