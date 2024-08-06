import { getAllRemoteConfig } from '@/utils/global-config';
import { computed } from 'vue';

export default function useGlobalConfig() {
  const remoteConfig = getAllRemoteConfig();
  const remote = computed(() => {
    return remoteConfig;
  });
  return { remote };
}
