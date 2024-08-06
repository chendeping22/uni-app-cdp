import type { Ref } from 'vue';
import { ref, watchEffect } from 'vue';
import { TPlayerInfo, getPlayerInfo } from '../services/common';
import { ping } from '../utils';

export const usePlayerInfo = (deviceId: Ref<string>) => {
  const playerInfo = ref<TPlayerInfo>();

  watchEffect(async () => {
    if (!deviceId.value) return (playerInfo.value = undefined);
    try {
      const res = await getPlayerInfo(deviceId.value);
      console.log('设备实时播放地址:', res);
      const { deviceExist, intranetMainUrl, intranetSubUrl, intranetUeigUrl } = res;
      if (!!deviceExist && intranetUeigUrl?.length) {
        const isIntranet = await ping(intranetUeigUrl);
        console.log('内网探测结果', isIntranet);
        if (isIntranet) {
          res.mainUrl = intranetMainUrl;
          res.subUrl = intranetSubUrl;
        }
      }
      playerInfo.value = res;
    } catch (error) {
      console.error(error);
    }
  });

  return playerInfo;
};
