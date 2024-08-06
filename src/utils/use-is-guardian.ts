import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
/**
 * 当前是否为家长端
 * @returns Boolean
 */
export default function useIsGuardian() {
  return loginStore().currentUserType === EUserType.guardian;
}
