import { LocationLevel, loginStore } from '@/store/modules/login';

/**
 * 当前组织是否为校端
 * @returns boolean
 */
function useIsSchool() {
  return loginStore().currentOrganization?.locationLevel === LocationLevel.School;
}

export default useIsSchool;
