import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
/**
 * 当前是否为教师端
 * @returns Boolean
 */
export default function useIsTeacher() {
  return loginStore().currentUserType === EUserType.teacher;
}
