import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { computed, ComputedRef } from 'vue';
/**
 * 当前学生id
 * @returns string
 */
export default function useStudentId(): ComputedRef<string | undefined> {
  return computed(() => {
    if (loginStore().currentUserType === EUserType.guardian) {
      return loginStore().currentOrganization?.childId + '';
    } else if (loginStore().currentUserType === EUserType.student) {
      return loginStore().userInfo?.personId;
    } else {
      return undefined;
    }
  });
}
