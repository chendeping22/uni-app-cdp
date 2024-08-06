import { LocationLevel, loginStore } from '@/store/modules/login';

/**
 * 当前组织是否为局端
 * @returns boolean
 */
function useIsBureau() {
  return loginStore().currentOrganization?.locationLevel === LocationLevel.Bureau;
}

export default useIsBureau;
