import { EApplicationType, type ETargetType, type IApplication } from '@/store/modules/workbench';
import { goToApplication } from './go-to-application';

export const goToWebView = (target: ETargetType, path: string, type = EApplicationType.New) => {
  const item: IApplication = {
    code: '',
    icon: '',
    id: '',
    name: '',
    path: path,
    target: target,
    type: type,
  };
  goToApplication(item);
};
