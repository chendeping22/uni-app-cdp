import { EApplicationType, ETargetType, IApplication } from '@/store/modules/workbench';
import { goToApplication } from '@/utils/go-to-application';
import useIsBureau from '@/utils/use-is-bureau';
import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const fileUploadByH5 = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const path = `/subPackages/app-platform/file-upload/index?fileCount=${
    options.data.fileCount ?? 1
  }&fileSize=${options.data.fileSize ?? 5}`;
  const item: IApplication = {
    code: '',
    icon: '',
    id: '',
    name: '上传附件',
    path: path,
    target: ETargetType.TargetTypeRelativeH5AtImp,
    type: EApplicationType.Old,
  };
  goToApplication(item);
  resolve({});
};

const fileUploadResult = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const files = options.data.files;
  uni.$emit('fileUploadResult', files);
  resolve({});
};

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
  fileUploadByH5,
  fileUploadResult,
  filePreview,
};
